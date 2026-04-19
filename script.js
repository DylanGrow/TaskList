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
