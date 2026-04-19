const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const errorMessage = document.getElementById('error-message');

async function syncWithAPI(taskText) {
    console.log(`Structured API Call: Securely sending "${taskText}" to database...`);
}

function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        errorMessage.style.display = 'block';
        return;
    }

    errorMessage.style.display = 'none';

    const li = document.createElement('li');
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.setAttribute('aria-label', `Mark task "${taskText}" as completed`);
    checkbox.addEventListener('change', function() {
        li.classList.toggle('completed');
    });

    const span = document.createElement('span');
    span.textContent = taskText;
    span.style.flexGrow = '1';

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'X';
    deleteBtn.setAttribute('aria-label', `Delete task "${taskText}"`);
    deleteBtn.style.padding = '5px 10px';
    deleteBtn.style.backgroundColor = 'transparent';
    deleteBtn.style.color = '#D32F2F';
    deleteBtn.style.border = '1px solid #D32F2F';
    
    deleteBtn.addEventListener('click', function() {
        li.remove();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);

    syncWithAPI(taskText);

    taskInput.value = '';
    taskInput.focus();
}

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});
/**
 * TaskFlow Pro - Vanilla JavaScript Controller
 * Handles all task CRUD operations, UI state, and localStorage persistence
 */

document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const errorMessage = document.getElementById('error-message');
    const taskCount = document.getElementById('task-count');

    // localStorage key
    const STORAGE_KEY = 'taskflow-pro-tasks';
    let taskIdCounter = 0;
    let tasks = [];

    /**
     * Load tasks from localStorage on init
     */
    function loadTasks() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                tasks = JSON.parse(stored);
                // Set counter to avoid ID collisions
                taskIdCounter = tasks.reduce((max, task) => {
                    const num = parseInt(task.id.split('-')[1]);
                    return num >= max? num + 1 : max;
                }, 0);
                tasks.forEach(task => renderTask(task, false));
            } catch (e) {
                console.error('Failed to parse stored tasks:', e);
                tasks = [];
            }
        }
        updateTaskCount();
    }

    /**
     * Save current tasks array to localStorage
     */
    function saveTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    /**
     * Placeholder for backend API integration
     * Demonstrates how frontend would securely send task data
     * @param {Object} taskData - Task object to sync
     * @returns {Promise} - Resolves with API response
     */
    async function syncWithAPI(taskData) {
        try {
            // In production: Replace with actual endpoint + auth headers
            // const response = await fetch('https://api.company.com/tasks', {
            // method: 'POST',
            // headers: {
            // 'Content-Type': 'application/json',
            // 'Authorization': 'Bearer ' + getAuthToken(),
            // 'X-CSRF-Token': getCsrfToken()
            // },
            // body: JSON.stringify(taskData)
            // });
            // return await response.json();

            console.log('[API SYNC] Task payload ready for backend:', taskData);
            return { success: true, id: taskData.id };
        } catch (error) {
            console.error('[API SYNC] Failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Updates the visible task count
     */
    function updateTaskCount() {
        const count = taskList.children.length;
        taskCount.textContent = `${count} ${count === 1? 'task' : 'tasks'}`;
    }

    /**
     * Shows error message for invalid input
     */
    function showError() {
        errorMessage.hidden = false;
        taskInput.setAttribute('aria-invalid', 'true');
        taskInput.focus();
    }

    /**
     * Hides error message
     */
    function hideError() {
        errorMessage.hidden = true;
        taskInput.setAttribute('aria-invalid', 'false');
    }

    /**
     * Renders a task to the DOM. Used for both new tasks and loading from storage.
     * @param {Object} taskData - Task object
     * @param {boolean} isNew - If true, saves to array + localStorage
     */
    function renderTask(taskData, isNew = true) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.setAttribute('id', taskData.id);
        if (taskData.completed) li.classList.add('completed');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = taskData.completed;
        checkbox.setAttribute('aria-label', `Mark task ${taskData.completed? 'incomplete' : 'complete'}: ${taskData.text}`);
        checkbox.addEventListener('change', () => toggleComplete(li, checkbox, taskData));

        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = taskData.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.setAttribute('aria-label', `Delete task: ${taskData.text}`);
        deleteBtn.addEventListener('click', () => deleteTask(li, taskData));

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);

        if (isNew) {
            tasks.push(taskData);
            saveTasks();
            syncWithAPI(taskData);
        }
    }

    /**
     * Creates new task object and renders it
     * @param {string} taskText - The task description
     */
    function addTask(taskText) {
        const trimmedText = taskText.trim();

        if (!trimmedText) {
            showError();
            return;
        }

        hideError();

        const taskId = `task-${taskIdCounter++}`;
        const taskData = {
            id: taskId,
            text: trimmedText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        renderTask(taskData, true);
        taskInput.value = '';
        updateTaskCount();
    }

    /**
     * Toggles completed state with strikethrough + persists
     * @param {HTMLElement} taskElement - The li element
     * @param {HTMLInputElement} checkbox - The checkbox
     * @param {Object} taskData - Task data object
     */
    function toggleComplete(taskElement, checkbox, taskData) {
        taskElement.classList.toggle('completed', checkbox.checked);
        taskData.completed = checkbox.checked;

        const label = checkbox.checked? 'Mark task incomplete' : 'Mark task complete';
        checkbox.setAttribute('aria-label', `${label}: ${taskData.text}`);

        // Update in tasks array and persist
        const taskIndex = tasks.findIndex(t => t.id === taskData.id);
        if (taskIndex > -1) {
            tasks[taskIndex].completed = checkbox.checked;
            saveTasks();
        }

        syncWithAPI({...taskData, action: 'update' });
    }

    /**
     * Removes task from DOM + storage
     * @param {HTMLElement} taskElement - The li element to remove
     * @param {Object} taskData - Task data object
     */
    function deleteTask(taskElement, taskData) {
        taskElement.remove();
        tasks = tasks.filter(t => t.id!== taskData.id);
        saveTasks();
        updateTaskCount();
        syncWithAPI({...taskData, action: 'delete' });
    }

    // Event Listeners: Click and Enter key support
    addTaskBtn.addEventListener('click', () => addTask(taskInput.value));

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask(taskInput.value);
        }
    });

    // Hide error on input
    taskInput.addEventListener('input', () => {
        if (!errorMessage.hidden) hideError();
    });

    // Init: Load stored tasks first
    loadTasks();
});
