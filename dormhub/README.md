# 🏠 DormHub – Dormitory Management System

A full-featured dormitory management system built with **React + Vite + Supabase**.

---

## ✨ Features

| Module | Description |
|---|---|
| 🔐 Auth | Login, Register, Forgot Password, Role-based access |
| 🚪 Rooms | Add/edit/delete rooms, set capacity, rent, track status |
| 👤 Tenants | Profiles, room assignment, move-in/out, ID & contract |
| 💰 Payments | Monthly billing, history, receipt, due-date tracking |
| 🔧 Maintenance | Submit requests, photo upload, Kanban status board |
| 🚶 Visitors | Time-in/out log, visitor registration, history |
| 🔔 Notifications | Payment reminders, maintenance updates, alerts |
| 📊 Dashboard | Revenue chart, occupancy stats, recent activity |

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste the full SQL from `supabase-schema.sql`
3. Copy your **Project URL** and **anon key** from Settings → API

### 3. Configure environment
```bash
cp .env.example .env
```
Fill in your credentials:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the app
```bash
npm run dev
```

### 5. Build for production
```bash
npm run build
```

The deployable static site is generated in `dist/`.

---

## 🌐 Deployment

Use these settings on Vercel, Netlify, Hostinger static hosting, or similar:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variables | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

SPA routing is already configured with `vercel.json` and `public/_redirects`, so refreshing `/rooms`, `/payments`, or `/student` should still load the app.

---

## 📁 Project Structure

```
dormhub/
├── index.html
├── vite.config.js
├── package.json
├── .env.example
└── src/
    ├── App.jsx                  # Router & layout
    ├── main.jsx                 # Entry point
    ├── styles/
    │   └── global.css           # Global styles & CSS variables
    ├── lib/
    │   ├── supabase.js          # Supabase client
    │   └── mockData.js          # Sample data (replace with real queries)
    ├── contexts/
    │   └── AuthContext.jsx      # Auth state & helpers
    ├── components/
    │   ├── Sidebar.jsx          # Navigation sidebar
    │   └── ui.jsx               # Shared UI components
    └── pages/
        ├── AuthPage.jsx         # Login / Register / Forgot
        ├── Dashboard.jsx        # Overview & charts
        ├── Rooms.jsx            # Room management
        ├── Tenants.jsx          # Tenant management
        ├── Payments.jsx         # Payment tracking
        ├── Maintenance.jsx      # Maintenance requests (Kanban)
        ├── Visitors.jsx         # Visitor log
        ├── Notifications.jsx    # Notifications
        └── SetupPage.jsx        # Supabase SQL setup guide
```

---

## 🗄️ Database Tables

- `profiles` — User accounts (extends Supabase auth)
- `rooms` — Room inventory
- `tenants` — Tenant records linked to users & rooms
- `payments` — Monthly billing records
- `maintenance_requests` — Repair/issue tickets
- `visitor_logs` — Visitor time-in/out records
- `notifications` — In-app notifications

---

## 🔌 Data Mode

The app uses live Supabase data when valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values are present. If those values are missing, it falls back to demo data so the UI can still be reviewed locally.

---

## 🛠️ Tech Stack

- **React 18** + **Vite**
- **Supabase** (Auth + PostgreSQL + Storage)
- **React Router v6**
- **Recharts** (dashboard charts)
- **Lucide React** (icons)

---

## 👥 User Roles

| Role | Access |
|---|---|
| `admin` | Full access to all modules |
| `staff` | Maintenance, visitor log |
| `student` | View own room, payments, submit requests |
