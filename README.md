# 🌿 TimeFlow — Productivity Hub

> **Master your time. Own your day.**

TimeFlow is a unified productivity web application that combines **7 proven time management methodologies** into a single, cohesive dashboard experience. Built with React 18, TypeScript, and Tailwind CSS, it runs entirely in the browser with no backend required — all data persists locally via `localStorage`.

---

## ✨ Strategies Included

| Strategy | Description |
|---|---|
| 🍅 **Pomodoro** | Work in 25-minute focused intervals with break timers and session logging |
| 🐸 **Eat The Frog** | Identify and complete your most important task first every day |
| 📅 **Time Blocking** | Schedule every hour of your day on a visual calendar grid |
| 📋 **Kanban Board** | Visualize work as cards moving through drag-and-drop columns |
| ✅ **GTD (Getting Things Done)** | Capture → Clarify → Organize → Reflect → Engage workflow |
| ⚡ **RPM (Rapid Planning Method)** | Think in outcomes: Result → Purpose → Massive Action Plan |
| 🫙 **Pickle Jar Theory** | Categorize tasks as Big Rocks, Pebbles, Sand, and Water |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) **v18 or newer**
- [npm](https://www.npmjs.com/) v9+ (comes with Node.js)
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/TejasMankeshwar/Time-Management.git
cd Time-Management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open your browser and navigate to **http://localhost:5173**.

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server with hot-reload |
| `npm run build` | Compile TypeScript and build the production bundle to `dist/` |
| `npm run preview` | Serve the production build locally for final verification |
| `npm run lint` | Run ESLint across all source files |

---

## 🏗️ Tech Stack

| Tool | Purpose |
|---|---|
| [React 18](https://react.dev/) | UI Component Framework |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Vite 8](https://vitejs.dev/) | Build tool & dev server |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling with CSS variables |
| [React Router v7](https://reactrouter.com/) | Client-side routing |
| [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight global state management |
| [Framer Motion](https://www.framer.com/motion/) | Animations and transitions |
| [Recharts](https://recharts.org/) | Analytics charts |
| [@dnd-kit](https://dndkit.com/) | Drag-and-drop (Kanban board) |
| [Lucide React](https://lucide.dev/) | Icon library |
| [date-fns](https://date-fns.org/) | Date utilities |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/           # Sidebar, TopBar, Layout wrapper
│   └── shared/           # Button, Card, Badge, Input, Modal
├── pages/                # One file per strategy page + Dashboard + Analytics
├── store/                # Zustand stores (one per domain)
│   ├── useAppStore.ts    # Global UI state (sidebar, user prefs)
│   ├── useTaskStore.ts   # Unified task list across all strategies
│   ├── usePomodoroStore.ts
│   ├── useKanbanStore.ts
│   └── useTimeBlockStore.ts
├── types/
│   └── index.ts          # All shared TypeScript interfaces
└── App.tsx               # Root component with React Router config
```

---

## 💾 Data Persistence

TimeFlow stores **all data locally** in your browser's `localStorage` — no account, no server, no internet connection required after the first load.

Each Zustand store has its own key:

| Store | localStorage key |
|---|---|
| App preferences | `timeflow-app-storage` |
| Tasks | `timeflow-tasks-storage` |
| Pomodoro sessions | `timeflow-pomodoro-storage` |
| Kanban board | `timeflow-kanban-storage` |
| Time blocks | `timeflow-timeblocks-storage` |

You can export all data as JSON (or as a CSV from the Analytics page) via the settings in each module.

---

## 🎨 Design System

The app uses a warm, professional light theme defined as CSS custom properties:

```css
--color-primary:       #2D6A4F  /* Deep sage green */
--color-primary-light: #52B788  /* Lighter sage */
--color-accent:        #E76F51  /* Terracotta (urgency) */
--color-accent-warm:   #F4A261  /* Amber (medium priority) */
--color-background:    #F9F8F6  /* Warm off-white */
--color-surface:       #FFFFFF  /* Card surfaces */
```

**Fonts** (loaded from Google Fonts):
- **Playfair Display** — headings and strategy titles
- **DM Sans** — body text and UI labels
- **JetBrains Mono** — timers and numeric counters

---

## 🌐 Browser Support

TimeFlow targets modern evergreen browsers:

- Chrome / Edge 90+
- Firefox 90+
- Safari 14+

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Built with ❤️ using React + TypeScript + Vite*
