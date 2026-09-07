# LUMINA Photography Management SaaS - Backend API

Production-grade Express.js & PostgreSQL backend powering the **LUMINA Photography Management SaaS** platform.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0 or higher
- **PostgreSQL**: v14.0 or higher

### 2. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
Ensure your PostgreSQL connection string is configured in `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lumina_db
PORT=5000
JWT_SECRET=lumina_production_jwt_super_secret_key_2026
CLIENT_URL=http://localhost:5173
```

### 3. Database Initialization
Create the database in PostgreSQL:
```bash
createdb lumina_db
```
Execute SQL migrations and seed realistic demo data:
```bash
npm run migrate
npm run seed
```

### 4. Start Server
Run development server with hot reload:
```bash
npm run dev
```
Expected output:
```text
⚡ Initializing LUMINA Photography Management Backend...
🐘 PostgreSQL connected successfully. Production database online.
=======================================================
🚀 LUMINA Backend API Server running on port 5000
📡 URL: http://localhost:5000
📡 Health Check: http://localhost:5000/api/health
📡 Dashboard Stats: http://localhost:5000/api/dashboard/stats
📡 Sales Overview: http://localhost:5000/api/sales/overview
=======================================================
```

---

## 🔑 Demo Login Credentials

All seeded accounts use password: `123456789`

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Great Master** | `master@greatmaster.io` | `123456789` | `/great-master/login` |
| **Studio Admin (Aurora)** | `priya@studioaurora.in` | `123456789` | `/login` |
| **Studio Admin (Pixel)** | `admin@pixelstories.in` | `123456789` | `/login` |
| **Sales Manager** | `krishna@lumina.io` | `123456789` | `/sales/dashboard` |
| **Photographer** | `karthik@dreamframes.in` | `123456789` | `/login` |
| **Client** | `arun.priya@gmail.com` | `123456789` | `/login` |

---

## 🧪 Automated Testing

Execute the comprehensive backend test suite:
```bash
npm test
```
Tests automatically verify:
- ✅ Health probe
- ✅ JWT Authentication & Password verification
- ✅ Role authorization guards
- ✅ PostgreSQL-derived dashboard statistics
- ✅ Client CRUD & tenant isolation
- ✅ Photography projects & 14-stage shoot workflow
- ✅ Sales CRM pipeline, leads, quotations, invoices, and attendance
- ✅ Notifications & audit logs

---

## 📂 Architecture

```text
backend/
├── src/
│   ├── config/
│   │   ├── database.ts        # PostgreSQL connection pool & transaction helper
│   │   └── env.ts             # Validated environment variables
│   ├── controllers/           # HTTP route handlers
│   ├── services/              # Business logic & database operations
│   ├── middleware/            # Auth, rate limiting, validation & error handler
│   ├── routes/                # Modular REST API routes
│   ├── utils/                 # Standard response & logging helpers
│   ├── validations/           # Schema validators
│   ├── app.ts                 # Express configuration with Helmet & CORS
│   └── server.ts              # Server bootstrapper & shutdown listener
├── migrations/
│   ├── 001_initial_schema.sql # PostgreSQL DDL with indexes & constraints
│   └── runner.ts              # Migration runner (npm run migrate)
├── seeders/
│   ├── 001_seed_data.sql      # Seed data SQL
│   └── seed.ts                # Seeder execution (npm run seed)
├── tests/
│   └── api.test.ts            # Automated API test suite
├── API_DOCUMENTATION.md       # Exhaustive REST API specification
└── package.json
```

---

## 🛡️ Security Implementations
- **Password Security**: Bcrypt with 10 salt rounds; plain-text passwords never stored.
- **JWT Authentication**: Cryptographically signed access tokens with configurable expiration.
- **Role Guards**: Granular role-based authorization for Great Master, Studio Admin, and Staff.
- **SQL Injection Prevention**: Parameterized queries across all database calls.
- **HTTP Protection**: Helmet security headers and CORS whitelisting.
- **Rate Limiting**: IP-based rate limiting on all API routes and strict limiting on auth routes.
