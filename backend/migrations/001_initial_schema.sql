-- ==============================================================================
-- LUMINA Photography Management SaaS - Complete PostgreSQL Database Schema
-- Migration: 001_initial_schema.sql
-- ==============================================================================

-- Enable pgcrypto extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. STUDIOS (Master Entities / Photography Businesses)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS studios (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    tagline TEXT,
    logo TEXT,
    cover_image TEXT,
    email VARCHAR(255) NOT NULL,
    reference_email VARCHAR(255),
    phone VARCHAR(50),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended', 'rejected', 'approved')),
    plan VARCHAR(100) DEFAULT 'Studio Pro' CHECK (plan IN ('Starter', 'Studio Pro', 'Enterprise')),
    amount NUMERIC DEFAULT 0,
    trial_status VARCHAR(50) DEFAULT 'PENDING' CHECK (trial_status IN ('PENDING', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'CONVERTED')),
    trial_start_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    payment_status VARCHAR(50) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED')),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_studios_status ON studios(status);
CREATE INDEX IF NOT EXISTS idx_studios_slug ON studios(slug);

-- ------------------------------------------------------------------------------
-- 2. USERS & AUTHENTICATION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    studio_id VARCHAR(100) REFERENCES studios(id) ON DELETE SET NULL,
    client_id VARCHAR(100),
    photographer_id VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL CHECK (role IN ('great_master', 'master', 'super_admin', 'studio_admin', 'staff', 'photographer', 'editor', 'sales', 'client')),
    avatar TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_studio_id ON users(studio_id);

-- ------------------------------------------------------------------------------
-- 3. CLIENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(100) PRIMARY KEY,
    studio_id VARCHAR(100) NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    serial_number VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    couple_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    event_type VARCHAR(100),
    shoot_type VARCHAR(50) DEFAULT 'Pre-Wedding',
    event_date DATE,
    location TEXT,
    package VARCHAR(255),
    budget NUMERIC DEFAULT 0,
    paid_amount NUMERIC DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'lead', 'inactive')),
    assigned_master_id VARCHAR(100) REFERENCES studios(id),
    active_shoot_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clients_studio_id ON clients(studio_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- ------------------------------------------------------------------------------
-- 4. PROJECTS / SHOOTS (Complete 14-Stage Photography Workflow)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(100) PRIMARY KEY,
    studio_id VARCHAR(100) NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    client_id VARCHAR(100) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    project_type VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    location TEXT,
    theme TEXT,
    description TEXT,
    status VARCHAR(50) DEFAULT 'LEAD' CHECK (status IN (
        'LEAD', 'CONFIRMED', 'PLANNING', 'PHOTOGRAPHER_ASSIGNED', 'SHOOTING', 
        'SHOOT_COMPLETED', 'UPLOADED', 'SELECTION', 'EDITING', 'INTERNAL_REVIEW', 
        'CLIENT_REVIEW', 'CLIENT_APPROVED', 'DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'
    )),
    budget NUMERIC DEFAULT 0,
    advance_paid NUMERIC DEFAULT 0,
    balance_due NUMERIC DEFAULT 0,
    assigned_photographer_id VARCHAR(100),
    photographer_name VARCHAR(255),
    cinematographer_id VARCHAR(100),
    cinematographer_name VARCHAR(255),
    drone_pilot VARCHAR(255),
    makeup_artist VARCHAR(255),
    costume_notes TEXT,
    locations_count INT DEFAULT 1,
    progress_percent INT DEFAULT 0,
    photo_count INT DEFAULT 0,
    selected_photo_count INT DEFAULT 0,
    edited_photo_count INT DEFAULT 0,
    notes TEXT,
    deliverables_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_studio_id ON projects(studio_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_event_date ON projects(event_date);

-- View/Alias to support queries querying "shoots"
CREATE OR REPLACE VIEW shoots AS SELECT 
    id, studio_id, client_id, project_name AS title, project_type AS type, 
    event_date AS shoot_date, location, theme, description, status, budget AS package_amount, 
    advance_paid AS paid_amount, balance_due, assigned_photographer_id AS photographer_id, 
    photographer_name, cinematographer_id, cinematographer_name, drone_pilot, makeup_artist, 
    costume_notes, locations_count, progress_percent, photo_count, selected_photo_count, 
    edited_photo_count, notes, deliverables_summary, created_at, updated_at
FROM projects;

-- ------------------------------------------------------------------------------
-- 5. PROJECT STATUS HISTORY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_status_history (
    id VARCHAR(100) PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_status_history_project_id ON project_status_history(project_id);

-- ------------------------------------------------------------------------------
-- 6. PHOTOGRAPHERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS photographers (
    id VARCHAR(100) PRIMARY KEY,
    studio_id VARCHAR(100) NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    profile_image TEXT,
    specialization JSONB DEFAULT '[]'::jsonb,
    experience VARCHAR(50),
    rating NUMERIC DEFAULT 5.0,
    availability_status VARCHAR(50) DEFAULT 'available' CHECK (availability_status IN ('available', 'on_shoot', 'leave', 'busy')),
    assigned_shoots_count INT DEFAULT 0,
    completed_shoots_count INT DEFAULT 0,
    equipment TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_photographers_studio_id ON photographers(studio_id);
CREATE INDEX IF NOT EXISTS idx_photographers_availability ON photographers(availability_status);

-- ------------------------------------------------------------------------------
-- 7. GALLERIES & PHOTOS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery_photos (
    id VARCHAR(100) PRIMARY KEY,
    shoot_id VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    gallery_id VARCHAR(100),
    studio_id VARCHAR(100) NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    title VARCHAR(255),
    category VARCHAR(100) DEFAULT 'Portraits',
    is_favorite BOOLEAN DEFAULT FALSE,
    is_selected BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    edit_status VARCHAR(50) DEFAULT 'raw' CHECK (edit_status IN ('raw', 'in_progress', 'edited', 'client_approved')),
    comments_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gallery_photos_shoot_id ON gallery_photos(shoot_id);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_category ON gallery_photos(category);

CREATE TABLE IF NOT EXISTS photo_comments (
    id VARCHAR(100) PRIMARY KEY,
    photo_id VARCHAR(100) NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
    shoot_id VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(50) DEFAULT 'client',
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 8. DELIVERABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deliverables (
    id VARCHAR(100) PRIMARY KEY,
    shoot_id VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    studio_id VARCHAR(100) NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    download_url TEXT NOT NULL,
    preview_url TEXT,
    file_size VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'delivered')),
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deliverables_shoot_id ON deliverables(shoot_id);

-- ------------------------------------------------------------------------------
-- 9. LEADS (Sales & Client Workspace)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(100) PRIMARY KEY,
    lead_code VARCHAR(50) NOT NULL,
    studio_id VARCHAR(100) NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    client_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_date DATE,
    location TEXT,
    source VARCHAR(100),
    estimated_budget NUMERIC DEFAULT 0,
    interested_package VARCHAR(255),
    status VARCHAR(50) DEFAULT 'To Do',
    priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    assigned_sales_person VARCHAR(255) DEFAULT 'Not Assigned',
    assigned_employee_id VARCHAR(100),
    last_contacted TIMESTAMP WITH TIME ZONE,
    next_follow_up TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    converted_client_id VARCHAR(100) REFERENCES clients(id) ON DELETE SET NULL,
    converted_project_id VARCHAR(100) REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_studio_id ON leads(studio_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);

-- ------------------------------------------------------------------------------
-- 10. SALES FOLLOW-UPS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_followups (
    id VARCHAR(100) PRIMARY KEY,
    studio_id VARCHAR(100) NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    lead_id VARCHAR(100) NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    client_name VARCHAR(255),
    contact VARCHAR(50),
    follow_up_date DATE NOT NULL,
    follow_up_time VARCHAR(50),
    contact_method VARCHAR(50) DEFAULT 'Phone Call',
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'MISSED', 'RESCHEDULED')),
    notes TEXT,
    assigned_person VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_followups_lead_id ON sales_followups(lead_id);
CREATE INDEX IF NOT EXISTS idx_sales_followups_date ON sales_followups(follow_up_date);

-- ------------------------------------------------------------------------------
-- 11. PACKAGES & SERVICES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS packages (
    id VARCHAR(100) PRIMARY KEY,
    studio_id VARCHAR(100) NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    duration VARCHAR(100),
    photographers_count INT DEFAULT 2,
    edited_photos_count INT DEFAULT 100,
    album VARCHAR(255),
    video VARCHAR(255),
    addons JSONB DEFAULT '[]'::jsonb,
    availability VARCHAR(100) DEFAULT 'Available',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_packages_studio_id ON packages(studio_id);

-- ------------------------------------------------------------------------------
-- 12. QUOTATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quotations (
    id VARCHAR(100) PRIMARY KEY,
    quotation_number VARCHAR(100) UNIQUE NOT NULL,
    studio_id VARCHAR(100) NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    lead_id VARCHAR(100) REFERENCES leads(id) ON DELETE SET NULL,
    client_id VARCHAR(100) REFERENCES clients(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    client_contact VARCHAR(50),
    client_email VARCHAR(255),
    event_type VARCHAR(100),
    event_date DATE,
    location TEXT,
    package_id VARCHAR(100) REFERENCES packages(id) ON DELETE SET NULL,
    package_name VARCHAR(255),
    package_price NUMERIC DEFAULT 0,
    addons JSONB DEFAULT '[]'::jsonb,
    discount_percent NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    tax_percent NUMERIC DEFAULT 18.00,
    tax_amount NUMERIC DEFAULT 0,
    final_amount NUMERIC DEFAULT 0,
    valid_until DATE,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'VIEWED', 'NEGOTIATION', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
    sent_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quotations_studio_id ON quotations(studio_id);
CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quotation_number);

-- ------------------------------------------------------------------------------
-- 13. INVOICES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(100) PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    studio_id VARCHAR(100) NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    lead_id VARCHAR(100) REFERENCES leads(id) ON DELETE SET NULL,
    client_id VARCHAR(100) REFERENCES clients(id) ON DELETE SET NULL,
    project_id VARCHAR(100) REFERENCES projects(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(50),
    employee_assigned VARCHAR(255),
    plan VARCHAR(100),
    billing_date DATE,
    due_date DATE,
    total_amount NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    paid_amount NUMERIC DEFAULT 0,
    balance_amount NUMERIC DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'Unpaid' CHECK (payment_status IN ('Paid', 'Partial Payment', 'Unpaid', 'Overdue', '—')),
    approval_status VARCHAR(50) DEFAULT 'Approved' CHECK (approval_status IN ('Approved', 'Not Approved', 'Pending')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoices_studio_id ON invoices(studio_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- ------------------------------------------------------------------------------
-- 14. PAYMENTS & TRANSACTIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(100) PRIMARY KEY,
    studio_id VARCHAR(100) NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    client_id VARCHAR(100) REFERENCES clients(id) ON DELETE SET NULL,
    shoot_id VARCHAR(100) REFERENCES projects(id) ON DELETE SET NULL,
    invoice_id VARCHAR(100) REFERENCES invoices(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100),
    amount NUMERIC NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'paid',
    payment_method VARCHAR(100) DEFAULT 'Bank Transfer',
    date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_studio_id ON payments(studio_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);

-- ------------------------------------------------------------------------------
-- 15. SALES APPROVALS & ATTENDANCE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_approvals (
    id VARCHAR(100) PRIMARY KEY,
    studio_id VARCHAR(100) NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    lead_code VARCHAR(50),
    client_name VARCHAR(255) NOT NULL,
    requested_by VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    amount NUMERIC DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_attendances (
    id VARCHAR(100) PRIMARY KEY,
    studio_id VARCHAR(100) NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    employee_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    check_in VARCHAR(50),
    check_out VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Present' CHECK (status IN ('Present', 'Late', 'Absent', 'Half-Day')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(100) PRIMARY KEY,
    studio_id VARCHAR(100) NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    joined_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 16. TASKS & WORKFLOW
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(100) PRIMARY KEY,
    project_id VARCHAR(100) REFERENCES projects(id) ON DELETE CASCADE,
    studio_id VARCHAR(100) NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to VARCHAR(255),
    due_date DATE,
    priority VARCHAR(50) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 17. NOTIFICATIONS & AUDIT / ACTIVITY LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(100) PRIMARY KEY,
    studio_id VARCHAR(100) REFERENCES studios(id) ON DELETE CASCADE,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    recipient_role VARCHAR(50) DEFAULT 'all',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'urgent')),
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(100) PRIMARY KEY,
    studio_id VARCHAR(100) REFERENCES studios(id) ON DELETE CASCADE,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
    shoot_id VARCHAR(100) REFERENCES projects(id) ON DELETE SET NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(100),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    description TEXT,
    details TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_studio_id ON activity_logs(studio_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

CREATE TABLE IF NOT EXISTS email_logs (
    id VARCHAR(100) PRIMARY KEY,
    studio_id VARCHAR(100) REFERENCES studios(id) ON DELETE CASCADE,
    email_type VARCHAR(100) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'SENT',
    preview_url TEXT,
    details TEXT
);

-- ------------------------------------------------------------------------------
-- 18. PUBLIC LANDING PAGE (Contacts, Demo Requests, Newsletters)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS demo_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    team_size VARCHAR(50),
    plan_interest VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
