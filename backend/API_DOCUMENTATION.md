# LUMINA Photography Management SaaS - REST API Documentation

Base URL: `http://localhost:5000/api`

## Table of Contents
1. [Authentication & Authorization](#1-authentication--authorization)
2. [Great Master & Studio Governance](#2-great-master--studio-governance)
3. [Client Management](#3-client-management)
4. [Photography Projects & 14-Stage Workflow](#4-photography-projects--14-stage-workflow)
5. [Sales & Client Workspace](#5-sales--client-workspace)
6. [Invoices & Billing](#6-invoices--billing)
7. [Payments & Transactions](#7-payments--transactions)
8. [Dashboard & Analytics](#8-dashboard--analytics)
9. [Notifications & Audit Logs](#9-notifications--audit-logs)

---

## 1. Authentication & Authorization

### `POST /api/auth/register`
Register a new user account.
- **Auth**: Public
- **Rate Limit**: 30 req / 15 min
- **Request Body**:
  ```json
  {
    "name": "Priya Sharma",
    "email": "priya@studioaurora.in",
    "password": "strongPassword123",
    "phone": "+91 98401 11223",
    "role": "studio_admin"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "usr_1788761234",
        "name": "Priya Sharma",
        "email": "priya@studioaurora.in",
        "role": "studio_admin",
        "status": "active"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### `POST /api/auth/login`
Authenticate existing user and issue JWT access token.
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "master@greatmaster.io",
    "password": "123456789"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "usr_super_admin",
        "name": "Rajesh Malhotra",
        "email": "master@greatmaster.io",
        "role": "great_master"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### `GET /api/auth/me`
Retrieve currently authenticated user profile.
- **Auth**: Bearer Token
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "usr_super_admin",
        "name": "Rajesh Malhotra",
        "email": "master@greatmaster.io",
        "role": "great_master"
      }
    }
  }
  ```

### `PUT /api/auth/profile`
Update user display name, phone, or avatar.
- **Auth**: Bearer Token
- **Request Body**:
  ```json
  {
    "name": "Rajesh Malhotra",
    "phone": "+91 98000 00001"
  }
  ```

### `PUT /api/auth/change-password`
Securely change password with current password verification.
- **Auth**: Bearer Token
- **Request Body**:
  ```json
  {
    "currentPassword": "123456789",
    "newPassword": "newSecurePassword123"
  }
  ```

---

## 2. Great Master & Studio Governance

### `GET /api/masters` (or `/api/studios`)
List all studio franchises with search and status filtering.
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Records per page (default: 20)
  - `status`: `active` | `pending` | `approved` | `rejected` | `suspended`
  - `search`: Studio name, city, or email
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "message": "Masters fetched successfully",
    "data": [
      {
        "id": "studio_1",
        "name": "Studio Aurora",
        "slug": "studio-aurora",
        "city": "Bangalore",
        "state": "Karnataka",
        "status": "active",
        "plan": "Studio Pro",
        "trial_status": "ACTIVE"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 6, "totalPages": 1 }
  }
  ```

### `GET /api/masters/:id`
Get studio franchise details with affiliated users and shoot counts.

### `PATCH /api/masters/:id/status`
Approve, activate, or suspend a studio franchise.
- **Request Body**:
  ```json
  {
    "status": "approved",
    "reason": "Verified business documentation."
  }
  ```

---

## 3. Client Management

### `GET /api/clients`
List clients with multi-tenant isolation, search, and sorting.
- **Query Parameters**:
  - `studioId`: Studio tenant filter (default: all)
  - `status`: `active` | `completed` | `lead`
  - `search`: Client name, couple name, email, or phone
  - `sortBy`: `created_at` | `name` | `event_date` | `budget`
  - `sortOrder`: `asc` | `desc`
  - `page` & `limit`

### `POST /api/clients`
Create a new photography client.
- **Request Body**:
  ```json
  {
    "name": "Arun & Priya",
    "email": "arun.priya@gmail.com",
    "phone": "+91 98840 98765",
    "eventType": "Destination Wedding",
    "location": "Palace Grounds, Bangalore",
    "budget": 250000,
    "eventDate": "2026-11-15"
  }
  ```

---

## 4. Photography Projects & 14-Stage Workflow

### `GET /api/projects` (or `/api/shoots`)
Retrieve all active and completed shoots across the 14 workflow stages:
`LEAD`, `CONFIRMED`, `PLANNING`, `PHOTOGRAPHER_ASSIGNED`, `SHOOTING`, `SHOOT_COMPLETED`, `UPLOADED`, `SELECTION`, `EDITING`, `INTERNAL_REVIEW`, `CLIENT_REVIEW`, `CLIENT_APPROVED`, `DELIVERY`, `DELIVERED`, `COMPLETED`, `CANCELLED`.

### `PATCH /api/projects/:id/status`
Advance project stage and log transition history.
- **Request Body**:
  ```json
  {
    "status": "EDITING",
    "notes": "Raw files processed, color grading commenced."
  }
  ```

---

## 5. Sales & Client Workspace

### `GET /api/sales/overview`
Calculate live CRM sales pipeline metrics from PostgreSQL.
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "data": {
      "totalLeads": 15,
      "newEnquiries": 6,
      "inReview": 4,
      "convertedClients": 5,
      "pendingFollowups": 3,
      "totalSales": 850000,
      "revenue": 620000,
      "conversionRate": 68,
      "pipelineValue": 1450000
    }
  }
  ```

### `GET /api/sales/leads` & `POST /api/sales/leads`
CRUD operations for sales leads.

### `POST /api/sales/leads/:id/convert`
Convert lead to active client & project atomically inside a PostgreSQL transaction.

### `GET /api/sales/quotations` & `POST /api/sales/quotations`
Generate customized quotations with automatic 18% GST and add-ons breakdown.

### `GET /api/sales/attendance`
Retrieve employee check-in and daily presence records.

### `GET /api/sales/approvals` & `PATCH /api/sales/approvals/:id/status`
Manage discounts and milestone payment approval requests.

---

## 6. Invoices & Billing

### `GET /api/sales/invoices` (or `/api/invoices`)
Retrieve studio billing and invoice status ledger.
- **Fields**: `invoiceId`, `leadName`, `billingDate`, `plan`, `payment` (`Paid` | `Partial Payment` | `Unpaid`), `status` (`Approved` | `Not Approved`), `amount`.

### `POST /api/invoices`
Create formal invoice.

### `PATCH /api/invoices/:id/status`
Toggle approval or payment status.

---

## 7. Payments & Transactions

### `GET /api/payments`
List incoming payments with payment method and reference identifiers.

### `POST /api/payments`
Record manual payment and automatically adjust invoice balance.

### `POST /api/payments/create-razorpay-order`
Create Razorpay order for online subscription or client deposit.

---

## 8. Dashboard & Analytics

### `GET /api/dashboard/stats`
Aggregate statistics across clients, active shoots, revenue, and conversion rates.

### `GET /api/dashboard/revenue`
Monthly revenue trajectory and service category breakdown.

---

## 9. Notifications & Audit Logs

### `GET /api/notifications`
List platform notifications for user roles.

### `PATCH /api/notifications/:id/read`
Mark notification as acknowledged.

### `GET /api/activity-logs`
Platform-wide audit trail recording user logins, status changes, and invoices.
