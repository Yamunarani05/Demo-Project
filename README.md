# Demo Project — Photography Business Management Smarter with AI

A modern, production-ready full-stack web application designed for professional photographers, creative studios, and agencies. Built with a React + Vite + Tailwind CSS + Framer Motion frontend and a Node.js + Express.js + PostgreSQL backend.

---

## 🌟 Key Features

- **Pixel-Accurate Prototype UI/UX**: Recreated with modern typography, smooth color transitions, soft lavender cards (`#F5F3FF`), and rich purple branding (`#5E35B1`).
- **Smooth Scroll & Micro-Animations**: Powered by Framer Motion with staggered reveals, subtle parallax, floating metric cards, and responsive milestone tracking.
- **Dynamic Curved Dashed Workflow**: Interactive 8-step photography roadmap connected with a responsive SVG purple dashed path and pulsing milestone indicators.
- **AI Smart Culling Progress Card**: Interactive visual preview with real-time status and animated progress tracking.
- **Interactive Modals & Full Validation**: Working "Get Started" Demo Request modal, Contact Form, and Newsletter subscription.
- **Full-Stack REST Architecture**:
  - `POST /api/demo-request` — Handle studio demo and trial requests
  - `POST /api/contact` — Client inquiry and contact submissions
  - `POST /api/newsletter` — Newsletter subscriptions
  - `GET /api/health` — API health check and database status
- **PostgreSQL Database Support**: Auto-migrating tables with resilient local memory fallback.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Motion**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Server Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (via `pg` pool with schema migrations)
- **Environment**: `dotenv`, `cors`, `tsx`

---

## 📦 Project Structure

```
├── client/                     # Vite + React + TypeScript + Tailwind CSS Frontend
│   ├── src/
│   │   ├── assets/             # Brand assets
│   │   ├── components/         # Reusable UI components & modals
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── AISection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── WorkflowSection.tsx
│   │   │   ├── PricingSection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   ├── ShowcaseSection.tsx
│   │   │   ├── StatsSection.tsx
│   │   │   ├── CTASection.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── DemoModal.tsx
│   │   │   ├── ContactModal.tsx
│   │   │   └── Toast.tsx
│   │   ├── data/               # High-res photography catalog
│   │   └── services/           # Backend API integration layer
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── db.ts               # PostgreSQL connection & migrations
│   │   ├── routes/             # REST API endpoints
│   │   └── index.ts            # Express server entry point
├── package.json                # Root scripts (dev, build, start)
└── .env.example                # Sample environment configuration
```

---

## 🛠️ Getting Started

### 1. Clone & Install Dependencies

```bash
# Install root dependencies
npm install

# Install client and server dependencies
npm run dev --prefix client
npm run dev --prefix server
```

### 2. Environment Variables

Copy `.env.example` to `server/.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/demoproject_db
```

### 3. Run Locally

```bash
# Run both client and server concurrently
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📄 License

MIT License © 2026 Demo Project. All rights reserved.
