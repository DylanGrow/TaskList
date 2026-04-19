# DRAFT. 📋
**The Universal Task Recorder**
*Write It Down — Get It Done.*

A universal, single-page task tracker with a vintage typewriter and editorial aesthetic. Built for everyone — no department, no domain, no limits.

---

## 📁 Project Structure

```
DRAFT/
├── index.html     # Semantic HTML5, inline SVG favicon, SEO & ARIA
├── style.css      # Typewriter / editorial aesthetic, blockquote tasks
├── script.js      # Vanilla JS — typewriter animation, tasks, localStorage
└── README.md      # Docs & Git commands
```

---

## ✨ Features

| Feature | Details |
|---|---|
| **Typewriter Taglines** | Rotating quotes animate letter-by-letter in the masthead |
| **Blockquote Task Cards** | Each task styled as a ledger entry with ruled-paper lines |
| **Inline SVG Favicon** | No external file needed — typewriter icon embedded in HTML |
| **Add Tasks** | Click SUBMIT or press `Enter` |
| **Validation** | Empty submission shakes the input and shows an error |
| **Complete Tasks** | Checkbox stamps a ✓ and applies editorial strikethrough |
| **Delete Tasks** | "Discard" slides the entry out with a smooth collapse |
| **Filter** | All / Active / Completed |
| **Clear Done** | Batch-discard completed entries |
| **Live Stats** | Total / Active / Done counters in the masthead |
| **Persistence** | All entries survive refreshes via `localStorage` |
| **API Sync** | `syncWithAPI()` placeholder with commit reference feedback |
| **Responsive** | Flexbox layout, fully mobile-optimized |
| **Accessible** | ARIA labels, live regions, keyboard navigation |

---

## 🎨 Design System

| Element | Value |
|---|---|
| **Primary font** | Special Elite (typewriter display) |
| **Body font** | Courier Prime (monospace) |
| **Serif accent** | IM Fell English (blockquotes, empty state) |
| **Background** | Aged parchment `#f2ebda` |
| **Ink** | Deep black `#1a1710` |
| **Accent** | Aged gold `#c8a85a` |
| **Error / Highlight** | Rust red `#8b2e18` |

---

## 🔌 API Integration

`syncWithAPI(task)` in `script.js` shows how a task would be sent to a backend:

```js
async function syncWithAPI(task) {
  // Displays "Committing to ledger…" status
  // Simulates 1.4s round-trip
  // Returns mock Ref ID on success (e.g. "DFT-A3F9XK")
  // Gracefully handles and displays errors

  // ── PRODUCTION: uncomment the fetch() block in script.js ──
  // Supply your API URL + Authorization header
}
```

---

## 🚀 Getting Started

```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .

# VS Code
# Right-click index.html → Open with Live Server
```

---

## 📤 Git Commands

```bash
# Initialize
cd /path/to/DRAFT
git init
git add index.html style.css script.js README.md
git commit -m "feat: initial release of DRAFT. universal task tracker"
git branch -M main

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/draft-tasks.git
git push -u origin main

# Push to GitLab
git remote add origin https://gitlab.com/YOUR_USERNAME/draft-tasks.git
git push -u origin main
```

### Ongoing workflow

```bash
git status
git add .
git commit -m "fix: description of change"
git push origin main
```

---

## ✅ QA Checklist

- [x] No overlapping elements at any viewport (320px – 1440px)
- [x] Typewriter animation loops through 10 rotating taglines
- [x] Blockquote left-border styling on all task cards
- [x] Inline SVG favicon renders in browser tab — no external file needed
- [x] Error message appears + input shakes on empty submit
- [x] Checkbox stamps ✓ and triggers CSS strikethrough
- [x] Discard slides task out with height collapse animation
- [x] Custom scrollbar styled in parchment + ink theme
- [x] Stats update after every mutation
- [x] localStorage persists across sessions
- [x] `syncWithAPI()` shows syncing → commit ref → auto-dismisses
- [x] Fully keyboard navigable

---

*DRAFT. — For everyone with something to do.*
