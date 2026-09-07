# Demo Project — Unified Full-Stack SaaS Photography Management

A modern, production-grade, multi-studio photography business management platform. Designed for photography studios, production teams, event coordinators, and creative agencies.

---

## 🏗️ Clean Project Architecture

```
Demo Project/
│
├── frontend/                                # [Unified Frontend Web App - Port 5173]
│   ├── src/
│   │   ├── pages/                          # LandingPage, Login, ModuleHub, Payment, Signup
│   │   ├── components/                     # Shared UI, Modals, ModuleSwitcher Navigation
│   │   ├── modules/                        # Unified module interfaces
│   │   │   ├── master/                     # Master Admin (Studios, Approvals, System Monitoring)
│   │   │   ├── sales/                      # Sales CRM (Leads, Proposals, Quotations)
│   │   │   ├── clients/                    # Studio Client Portal (Projects, Shoots, Milestones)
│   │   │   └── pre-production/             # Pre-Production CRM (Raw Data, QC Checking, Delivery)
│   │   ├── routes/                         # Centralized Application Router
│   │   └── services/                       # API integration layer (connects to port 5000)
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                                 # [Unified Backend REST API - Port 5000]
│   ├── src/
│   │   ├── routes/                         # REST API endpoints (auth, studios, clients, master, payments, etc.)
│   │   ├── models/db.ts                    # PostgreSQL schema + Resilient In-Memory Fallback
│   │   ├── services/                       # Email dispatch, Razorpay payment verification, Trials
│   │   └── server.ts                       # Express API Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── modules/                                 # [Standalone Module Implementations]
│   ├── master-admin/                       # MasterAdmin standalone backend (:5011) & frontend (:5176)
│   ├── pre-production/                     # Pre-Production standalone backend (:5001) & frontend
│   ├── sales/                              # Sales standalone codebase (seed & schemas)
│   └── client/                             # Client & Studio workspace reference notes
│
├── server/                                  # [Preserved Legacy Server - Port 5000]
│
├── video/                                   # Screen recordings & demonstration videos
├── .env.example                             # Master environment variable configuration
├── package.json                             # Root Workspace Controller & Single-Command Runner
├── package-lock.json
└── README.md                                # This Documentation
```

---

## 🔄 High-Level Application Workflow

```
                   Landing Page (/)
                          ↓
             Authentication / Login (/login)
                          ↓
            Unified Module Hub (/dashboard)
                          ↓
      ┌───────────────────┼───────────────────┐
      ↓                   ↓                   ↓
👑 Master Admin    💼 Sales / Client    🎬 Pre-Production
 (/master/*)        (/sales/*, /studio/*)  (/pre-production/*)
      ↓                   ↓                   ↓
• Admin Dashboard   • Sales Dashboard   • CRM Dashboard
• Studios List      • Leads Pipeline    • Assign Client
• User Management   • Quotation PDF     • Raw Data Intake
• Studio Approvals  • Client Workspace  • QC Check Approvals
• System Monitoring • 8-Step Workflow   • Final Client Delivery
```

### Seamless Module Transitions
Inside the application, a persistent **Module Switcher Bar** is anchored across all module layouts:
```
[ 👑 Master Admin ]  [ 💼 Sales / Client ]  [ 🎬 Pre-Production ]
```
Clicking any module instantly transitions between modules without reloading or opening separate browser windows.

---

## ⚡ Quick Start: Single Command to Run

From the root directory:
```powershell
PS D:\Demo Project>
```

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend and backend dependencies
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure Environment & PostgreSQL Database
Copy `.env.example` to `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

If PostgreSQL is running locally:
```bash
createdb lumina_db
npm run migrate
npm run seed
```
*(The backend supports full PostgreSQL persistence and also includes a resilient fallback store if PostgreSQL is temporarily offline).*

### 3. Start the Complete Project (Single Terminal)
```bash
npm run dev
```

This single command starts both the **Backend API (port 5000)** and **Frontend (port 5173)** concurrently with color-coded terminal logs!

### 4. Run Automated Backend Tests
```bash
npm test
```
Executes the comprehensive 20-point test suite verifying authentication, client/project CRUD, sales overview, invoices, and dashboards.

---

## 🌐 Application URLs & Port Map

| Component | Port | Local URL | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | `5173` | [http://localhost:5173](http://localhost:5173) | Main unified SaaS application & modules |
| **Module Hub** | `5173` | [http://localhost:5173/dashboard](http://localhost:5173/dashboard) | Central module selector & workspace launcher |
| **Master Admin** | `5173` | [http://localhost:5173/master/dashboard](http://localhost:5173/master/dashboard) | Multi-studio administration & approvals |
| **Sales Module** | `5173` | [http://localhost:5173/sales/dashboard](http://localhost:5173/sales/dashboard) | Leads pipeline & quotation generator |
| **Studio / Client** | `5173` | [http://localhost:5173/studio/dashboard](http://localhost:5173/studio/dashboard) | Client shoots, workspaces, & milestones |
| **Pre-Production** | `5173` | [http://localhost:5173/pre-production/dashboard](http://localhost:5173/pre-production/dashboard) | Shoot crew intake, QC checking, & delivery |
| **Backend API** | `5000` | [http://localhost:5000/api](http://localhost:5000/api) | Express REST API server |
| **API Health Check** | `5000` | [http://localhost:5000/api/health](http://localhost:5000/api/health) | Backend & database health status |
| *Pre-Production Standalone Backend* | `5001` | [http://localhost:5001/api](http://localhost:5001/api) | Optional standalone backend (`modules/pre-production`) |
| *Master Admin Standalone Backend* | `5011` | [http://localhost:5011/api](http://localhost:5011/api) | Optional legacy backend (`modules/master-admin`) |

---

## 🛠️ Root package.json Scripts

Manage the entire repository from `D:\Demo Project>`:

```bash
# Start the full-stack development environment (Backend + Frontend)
npm run dev

# Start all services including standalone Pre-Production server (:5001)
npm run dev:all

# Start only the frontend Vite development server
npm run frontend

# Start only the backend Express API server
npm run backend

# Launch directly into Master Admin
npm run master-admin

# Launch directly into Pre-Production
npm run pre-production

# Launch directly into Sales
npm run sales

# Compile and build both backend and frontend for production
npm run build

# Start production server
npm run start
```

---

## 🛑 How to Stop Services

To terminate running development servers in the terminal:
- Press `Ctrl + C` in the integrated terminal.
- Type `Y` (if prompted) to terminate batch jobs.

---

## 📄 License & Team
Demo Project © 2026. All rights reserved.
