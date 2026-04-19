/**
 * TaskFlow Pro – script.js
 * Vanilla JavaScript task tracker for the Accounting Department.
 *
 * Features:
 *  - Add tasks via button click or Enter key
 *  - Empty-submission error message
 *  - Checkbox toggle → "completed" strikethrough state
 *  - Delete button removes task from DOM
 *  - Filter tasks (All / Active / Completed)
 *  - Clear Completed batch action
 *  - Live task-count stats in the header
 *  - Persist tasks to localStorage
 *  - syncWithAPI() – async placeholder for backend integration
 */

'use strict';

/* ═══════════════════════════════════════════════
   DOM REFERENCES
   ═══════════════════════════════════════════════ */
const taskInput         = document.getElementById('task-input');
const addBtn            = document.getElementById('add-btn');
const taskList          = document.getElementById('task-list');
const errorMsg          = document.getElementById('error-msg');
const syncStatus        = document.getElementById('sync-status');
const emptyState        = document.getElementById('empty-state');
const filterBtns        = document.querySelectorAll('.filter-btn[data-filter]');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const countTotal        = document.getElementById('count-total');
const countActive       = document.getElementById('count-active');
const countDone         = document.getElementById('count-done');
const footerYear        = document.getElementById('footer-year');

/* ═══════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════ */
let tasks         = [];           // Array of task objects
let activeFilter  = 'all';        // 'all' | 'active' | 'completed'
let taskIdCounter = 0;            // Simple incrementing ID

/* ═══════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════ */
function init() {
  footerYear.textContent = new Date().getFullYear();
  loadFromStorage();
  renderAll();
  attachEventListeners();
}

/* ═══════════════════════════════════════════════
   EVENT LISTENERS
   ═══════════════════════════════════════════════ */
function attachEventListeners() {
  // Add task on button click
  addBtn.addEventListener('click', handleAddTask);

  // Add task on Enter key
  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAddTask();
  });

  // Hide error when user starts typing
  taskInput.addEventListener('input', () => {
    if (taskInput.value.trim() !== '') hideError();
  });

  // Filter buttons
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      updateFilterUI(btn);
      renderTaskList();
    });
  });

  // Clear completed
  clearCompletedBtn.addEventListener('click', handleClearCompleted);
}

/* ═══════════════════════════════════════════════
   HANDLE ADD TASK
   ═══════════════════════════════════════════════ */
function handleAddTask() {
  const rawText = taskInput.value.trim();

  if (!rawText) {
    showError();
    taskInput.focus();
    return;
  }

  hideError();

  const newTask = {
    id:          ++taskIdCounter,
    text:        sanitize(rawText),
    completed:   false,
    createdAt:   new Date().toISOString(),
  };

  tasks.unshift(newTask);   // newest first
  saveToStorage();
  renderAll();

  taskInput.value = '';
  taskInput.focus();

  // Fire async API sync (non-blocking)
  syncWithAPI(newTask);
}

/* ═══════════════════════════════════════════════
   RENDER FUNCTIONS
   ═══════════════════════════════════════════════ */
function renderAll() {
  renderTaskList();
  updateStats();
}

function renderTaskList() {
  // Filter tasks based on current filter
  const filtered = tasks.filter((task) => {
    if (activeFilter === 'active')    return !task.completed;
    if (activeFilter === 'completed') return task.completed;
    return true;
  });

  // Clear existing list items
  taskList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.removeAttribute('aria-hidden');
    emptyState.style.display = 'block';
  } else {
    emptyState.setAttribute('aria-hidden', 'true');
    emptyState.style.display = 'none';

    filtered.forEach((task) => {
      taskList.appendChild(createTaskElement(task));
    });
  }
}

/**
 * Creates and returns a <li> element for a given task object.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createTaskElement(task) {
  const li = document.createElement('li');
  li.classList.add('task-item');
  li.dataset.id = task.id;
  if (task.completed) li.classList.add('completed');
  li.setAttribute('role', 'listitem');

  const checkboxId = `checkbox-${task.id}`;
  const formattedDate = formatDate(task.createdAt);

  li.innerHTML = `
    <input
      type="checkbox"
      id="${checkboxId}"
      class="task-checkbox"
      aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}: ${task.text}"
      ${task.completed ? 'checked' : ''}
    />
    <label for="${checkboxId}" class="task-checkbox-label" aria-hidden="true"></label>

    <div class="task-content">
      <span class="task-text">${task.text}</span>
      <div class="task-meta">
        <span class="task-timestamp" aria-label="Added ${formattedDate}">${formattedDate}</span>
      </div>
    </div>

    <button
      class="btn-delete"
      aria-label="Delete task: ${task.text}"
      title="Remove this task"
    >Remove</button>
  `;

  // Checkbox: toggle completed state
  const checkbox = li.querySelector('.task-checkbox');
  checkbox.addEventListener('change', () => toggleTask(task.id));

  // Delete button: remove task
  const deleteBtn = li.querySelector('.btn-delete');
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  return li;
}

/* ═══════════════════════════════════════════════
   TASK OPERATIONS
   ═══════════════════════════════════════════════ */
function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveToStorage();
  renderAll();
}

function deleteTask(id) {
  // Animate removal
  const li = taskList.querySelector(`[data-id="${id}"]`);
  if (li) {
    li.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    li.style.opacity    = '0';
    li.style.transform  = 'translateX(20px)';
    setTimeout(() => {
      tasks = tasks.filter((t) => t.id !== id);
      saveToStorage();
      renderAll();
    }, 250);
  }
}

function handleClearCompleted() {
  const completedCount = tasks.filter((t) => t.completed).length;
  if (completedCount === 0) return;

  if (confirm(`Remove ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
    tasks = tasks.filter((t) => !t.completed);
    saveToStorage();
    renderAll();
  }
}

/* ═══════════════════════════════════════════════
   STATS
   ═══════════════════════════════════════════════ */
function updateStats() {
  const total     = tasks.length;
  const done      = tasks.filter((t) => t.completed).length;
  const active    = total - done;

  countTotal.textContent  = total;
  countActive.textContent = active;
  countDone.textContent   = done;
}

/* ═══════════════════════════════════════════════
   FILTER UI
   ═══════════════════════════════════════════════ */
function updateFilterUI(activeBtn) {
  filterBtns.forEach((btn) => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });
  activeBtn.classList.add('active');
  activeBtn.setAttribute('aria-pressed', 'true');
}

/* ═══════════════════════════════════════════════
   ERROR DISPLAY
   ═══════════════════════════════════════════════ */
function showError() {
  errorMsg.removeAttribute('hidden');
  taskInput.setAttribute('aria-invalid', 'true');
  // Shake animation
  taskInput.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-6px)' },
    { transform: 'translateX(6px)' },
    { transform: 'translateX(-4px)' },
    { transform: 'translateX(0)' },
  ], { duration: 350, easing: 'ease-in-out' });
}

function hideError() {
  errorMsg.setAttribute('hidden', '');
  taskInput.removeAttribute('aria-invalid');
}

/* ═══════════════════════════════════════════════
   API INTEGRATION (Async Placeholder)
   ═══════════════════════════════════════════════ */
/**
 * syncWithAPI – Demonstrates how to securely POST a new task to a
 * backend REST API endpoint. Replace the URL and auth header with real
 * values in a production environment.
 *
 * Security notes:
 *  • The API key / JWT token should be stored server-side or injected
 *    via an environment variable at build time — NEVER hardcoded here.
 *  • In production, use HTTPS exclusively and validate the payload
 *    server-side to prevent injection attacks.
 *  • The Content-Type header ensures the server treats the body as JSON.
 *
 * @param {Object} task - The task object to sync
 * @returns {Promise<void>}
 */
async function syncWithAPI(task) {
  showSyncStatus('syncing', '⟳  Syncing with server…');

  try {
    // ── Simulated network delay (remove in production) ──
    await simulatedDelay(1200);

    /* ── PRODUCTION TEMPLATE (uncomment and configure) ──────────────────
    const response = await fetch('https://api.yourdomain.com/v1/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Token retrieved from a secure session cookie or auth provider:
        'Authorization': `Bearer ${getSessionToken()}`,
      },
      body: JSON.stringify({
        text:      task.text,
        completed: task.completed,
        createdAt: task.createdAt,
        department: 'accounting',
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    console.info('[TaskFlow Pro] Task synced:', data);
    ──────────────────────────────────────────────────────────────────── */

    // Simulate a successful response for the demo
    const mockResponse = {
      success: true,
      serverId: `SRV-${Math.floor(Math.random() * 90000) + 10000}`,
      message: 'Task saved to accounting database.',
    };

    console.info('[TaskFlow Pro] syncWithAPI → Mock response:', mockResponse);
    showSyncStatus('success', `✓  Synced — Server ID: ${mockResponse.serverId}`);

  } catch (err) {
    console.error('[TaskFlow Pro] syncWithAPI → Error:', err);
    showSyncStatus('error', `✕  Sync failed: ${err.message || 'Network error'}`);
  } finally {
    // Auto-dismiss sync status after 4 seconds
    setTimeout(hideSyncStatus, 4000);
  }
}

/* ── Sync status helpers ── */
function showSyncStatus(type, message) {
  syncStatus.removeAttribute('hidden');
  syncStatus.className = `sync-status ${type}`;
  syncStatus.textContent = message;
}

function hideSyncStatus() {
  syncStatus.setAttribute('hidden', '');
  syncStatus.className = 'sync-status';
  syncStatus.textContent = '';
}

/**
 * Simulated async delay — replace with real fetch() in production.
 * @param {number} ms
 */
function simulatedDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ═══════════════════════════════════════════════
   LOCAL STORAGE PERSISTENCE
   ═══════════════════════════════════════════════ */
const STORAGE_KEY     = 'taskflow_pro_tasks';
const COUNTER_KEY     = 'taskflow_pro_counter';

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    localStorage.setItem(COUNTER_KEY, String(taskIdCounter));
  } catch (e) {
    console.warn('[TaskFlow Pro] localStorage unavailable:', e);
  }
}

function loadFromStorage() {
  try {
    const stored  = localStorage.getItem(STORAGE_KEY);
    const counter = localStorage.getItem(COUNTER_KEY);
    if (stored)  tasks         = JSON.parse(stored);
    if (counter) taskIdCounter = parseInt(counter, 10);
  } catch (e) {
    console.warn('[TaskFlow Pro] Could not load from localStorage:', e);
    tasks = [];
  }
}

/* ═══════════════════════════════════════════════
   UTILITY HELPERS
   ═══════════════════════════════════════════════ */

/**
 * Sanitizes user input to prevent XSS by escaping HTML characters.
 * @param {string} str
 * @returns {string}
 */
function sanitize(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Formats an ISO date string into a human-readable short date.
 * @param {string} iso
 * @returns {string}
 */
function formatDate(iso) {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/* ═══════════════════════════════════════════════
   BOOTSTRAP
   ═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', init);
