/**
 * DRAFT. — script.js
 * Universal Task Tracker
 *
 * Features:
 *  - Typewriter animation for rotating taglines
 *  - Add tasks via button or Enter key
 *  - Empty submission error display
 *  - Checkbox toggle → completed strikethrough state
 *  - Delete button with fade-out animation
 *  - Filter (All / Active / Completed)
 *  - Clear Completed batch action
 *  - Live stat counters
 *  - localStorage persistence
 *  - syncWithAPI() async placeholder for backend integration
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
const typewriterLine    = document.getElementById('typewriter-line');

/* ═══════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════ */
let tasks         = [];
let activeFilter  = 'all';
let taskIdCounter = 0;

/* ═══════════════════════════════════════════════
   TYPEWRITER TAGLINE
   ═══════════════════════════════════════════════ */
const TAGLINES = [
  'The blank page is your oldest ally.',
  'Every great plan began as a scribble.',
  'Write it down. Make it real.',
  'One task at a time. That\'s all it takes.',
  'Clarity lives in lists.',
  'Ink is the antidote to forgetting.',
  'The shortest pencil beats the longest memory.',
  'What gets written gets done.',
  'Draft first. Perfect later.',
  'Your to-do list is your autobiography in progress.',
];

let twIndex     = 0;
let twCharIndex = 0;
let twDeleting  = false;
let twTimeout   = null;

function typewriterTick() {
  const current = TAGLINES[twIndex];

  if (!twDeleting) {
    // Typing forward
    twCharIndex++;
    typewriterLine.textContent = current.slice(0, twCharIndex);

    if (twCharIndex === current.length) {
      // Pause at end before deleting
      twTimeout = setTimeout(() => {
        twDeleting = true;
        typewriterTick();
      }, 2800);
      return;
    }
    // Randomise typing speed for realism
    const speed = 42 + Math.random() * 38;
    twTimeout = setTimeout(typewriterTick, speed);
  } else {
    // Deleting
    twCharIndex--;
    typewriterLine.textContent = current.slice(0, twCharIndex);

    if (twCharIndex === 0) {
      twDeleting = false;
      twIndex    = (twIndex + 1) % TAGLINES.length;
      twTimeout  = setTimeout(typewriterTick, 500);
      return;
    }
    const speed = 18 + Math.random() * 20;
    twTimeout = setTimeout(typewriterTick, speed);
  }
}

/* ═══════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════ */
function init() {
  footerYear.textContent = new Date().getFullYear();
  loadFromStorage();
  renderAll();
  attachEventListeners();
  // Start typewriter after short delay
  setTimeout(typewriterTick, 800);
}

/* ═══════════════════════════════════════════════
   EVENT LISTENERS
   ═══════════════════════════════════════════════ */
function attachEventListeners() {
  addBtn.addEventListener('click', handleAddTask);

  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAddTask();
  });

  taskInput.addEventListener('input', () => {
    if (taskInput.value.trim() !== '') hideError();
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      updateFilterUI(btn);
      renderTaskList();
    });
  });

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
    id:        ++taskIdCounter,
    text:      sanitize(rawText),
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(newTask);
  saveToStorage();
  renderAll();

  taskInput.value = '';
  taskInput.focus();

  syncWithAPI(newTask);
}

/* ═══════════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════════ */
function renderAll() {
  renderTaskList();
  updateStats();
}

function renderTaskList() {
  const filtered = tasks.filter((task) => {
    if (activeFilter === 'active')    return !task.completed;
    if (activeFilter === 'completed') return task.completed;
    return true;
  });

  taskList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    emptyState.removeAttribute('aria-hidden');
  } else {
    emptyState.style.display = 'none';
    emptyState.setAttribute('aria-hidden', 'true');
    filtered.forEach((task, index) => {
      taskList.appendChild(createTaskElement(task, filtered.length - index));
    });
  }
}

/**
 * Builds the <li> for a task, including blockquote style, checkbox, and delete.
 * @param {Object} task
 * @param {number} entryNum  — displayed as a stamp in the corner
 * @returns {HTMLLIElement}
 */
function createTaskElement(task, entryNum) {
  const li = document.createElement('li');
  li.classList.add('task-item');
  if (task.completed) li.classList.add('completed');
  li.dataset.id  = task.id;
  li.dataset.num = `#${String(entryNum).padStart(3, '0')}`;
  li.setAttribute('role', 'listitem');

  const checkId = `chk-${task.id}`;
  const dateStr  = formatDate(task.createdAt);

  li.innerHTML = `
    <input
      type="checkbox"
      id="${checkId}"
      class="task-checkbox"
      aria-label="Mark as ${task.completed ? 'incomplete' : 'complete'}: ${task.text}"
      ${task.completed ? 'checked' : ''}
    />
    <label for="${checkId}" class="task-checkbox-label" aria-hidden="true"></label>

    <div class="task-content">
      <span class="task-text">${task.text}</span>
      <span class="task-timestamp" aria-label="Filed ${dateStr}">Filed: ${dateStr}</span>
    </div>

    <button
      class="btn-delete"
      aria-label="Delete entry: ${task.text}"
      title="Discard this entry"
    >Discard</button>
  `;

  li.querySelector('.task-checkbox').addEventListener('change', () => toggleTask(task.id));
  li.querySelector('.btn-delete').addEventListener('click', () => deleteTask(task.id));

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
  const li = taskList.querySelector(`[data-id="${id}"]`);
  if (li) {
    li.style.transition = 'opacity 0.3s ease, transform 0.3s ease, max-height 0.3s ease';
    li.style.opacity    = '0';
    li.style.transform  = 'translateX(20px)';
    li.style.maxHeight  = li.offsetHeight + 'px';
    // Collapse height after fade
    setTimeout(() => {
      li.style.maxHeight  = '0';
      li.style.marginBottom = '0';
      li.style.padding    = '0';
      li.style.overflow   = 'hidden';
    }, 200);
    setTimeout(() => {
      tasks = tasks.filter((t) => t.id !== id);
      saveToStorage();
      renderAll();
    }, 420);
  }
}

function handleClearCompleted() {
  const n = tasks.filter((t) => t.completed).length;
  if (n === 0) return;
  if (confirm(`Discard ${n} completed entr${n > 1 ? 'ies' : 'y'}?`)) {
    tasks = tasks.filter((t) => !t.completed);
    saveToStorage();
    renderAll();
  }
}

/* ═══════════════════════════════════════════════
   STATS
   ═══════════════════════════════════════════════ */
function updateStats() {
  const total  = tasks.length;
  const done   = tasks.filter((t) => t.completed).length;
  const active = total - done;
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
  taskInput.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-5px)' },
    { transform: 'translateX(5px)' },
    { transform: 'translateX(-3px)' },
    { transform: 'translateX(0)' },
  ], { duration: 300, easing: 'ease-in-out' });
}

function hideError() {
  errorMsg.setAttribute('hidden', '');
  taskInput.removeAttribute('aria-invalid');
}

/* ═══════════════════════════════════════════════
   API INTEGRATION (Async Placeholder)
   ═══════════════════════════════════════════════ */
/**
 * syncWithAPI — Demonstrates secure task submission to a backend API.
 *
 * Security notes:
 *  • Never store auth tokens in JS variables. Use HTTP-only cookies
 *    or inject via a secure server-side session.
 *  • Always use HTTPS in production.
 *  • Validate and sanitize input on the server, independent of client-side sanitization.
 *
 * @param {Object} task - The task object to sync
 * @returns {Promise<void>}
 */
async function syncWithAPI(task) {
  showSyncStatus('syncing', '⌛  Committing to ledger…');

  try {
    await simulatedDelay(1400);

    /* ── PRODUCTION TEMPLATE ─────────────────────────────────────────────
    const response = await fetch('https://api.yourdomain.com/v1/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSessionToken()}`,
      },
      body: JSON.stringify({
        text:      task.text,
        completed: task.completed,
        createdAt: task.createdAt,
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    console.info('[DRAFT.] Task synced:', data);
    ─────────────────────────────────────────────────────────────────────── */

    const mockId = `DFT-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
    console.info('[DRAFT.] syncWithAPI → Mock commit:', { id: mockId, task });
    showSyncStatus('success', `✓  Entry committed — Ref: ${mockId}`);

  } catch (err) {
    console.error('[DRAFT.] syncWithAPI error:', err);
    showSyncStatus('error', `✕  Commit failed: ${err.message || 'Connection error'}`);
  } finally {
    setTimeout(hideSyncStatus, 4000);
  }
}

function showSyncStatus(type, message) {
  syncStatus.removeAttribute('hidden');
  syncStatus.className = `sync-status ${type}`;
  syncStatus.textContent = message;
}

function hideSyncStatus() {
  syncStatus.setAttribute('hidden', '');
  syncStatus.className   = 'sync-status';
  syncStatus.textContent = '';
}

function simulatedDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ═══════════════════════════════════════════════
   LOCAL STORAGE
   ═══════════════════════════════════════════════ */
const STORAGE_KEY  = 'draft_tasks_v1';
const COUNTER_KEY  = 'draft_counter_v1';

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY,  JSON.stringify(tasks));
    localStorage.setItem(COUNTER_KEY,  String(taskIdCounter));
  } catch (e) {
    console.warn('[DRAFT.] localStorage write failed:', e);
  }
}

function loadFromStorage() {
  try {
    const stored  = localStorage.getItem(STORAGE_KEY);
    const counter = localStorage.getItem(COUNTER_KEY);
    if (stored)  tasks         = JSON.parse(stored);
    if (counter) taskIdCounter = parseInt(counter, 10);
  } catch (e) {
    console.warn('[DRAFT.] localStorage read failed:', e);
    tasks = [];
  }
}

/* ═══════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════ */

/** XSS sanitization */
function sanitize(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, (m) => map[m]);
}

/** Human-readable date */
function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return ''; }
}

/* ═══════════════════════════════════════════════
   BOOTSTRAP
   ═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', init);
