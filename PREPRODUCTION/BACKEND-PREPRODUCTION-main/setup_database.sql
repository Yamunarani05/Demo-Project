-- ============================================================
-- RED ANGLE PRE & POST PRODUCTION — COMPLETE DATABASE SETUP
-- Database: "Redangle-Pre"
-- Run this entire script inside pgAdmin 4 Query Tool
-- (connected to the "Redangle-Pre" database)
-- ============================================================

-- ============================================================
-- 1. USERS TABLE
-- Stores login credentials and role assignments for all staff
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  role            VARCHAR(100),
  roles           TEXT[] NOT NULL DEFAULT '{}'::text[],
  is_active       BOOLEAN DEFAULT TRUE,
  employee_id     INTEGER,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 2. EMPLOYEES TABLE
-- Master employee records with profile and role info
-- ============================================================
CREATE TABLE IF NOT EXISTS employees (
  id                 SERIAL PRIMARY KEY,
  employee_id        VARCHAR(50) UNIQUE,
  first_name         VARCHAR(100),
  last_name          VARCHAR(100),
  email              VARCHAR(255) UNIQUE,
  contact_number     VARCHAR(50),
  dob                DATE,
  address            TEXT,
  work_location      VARCHAR(255),
  role               VARCHAR(100),
  roles              TEXT[] NOT NULL DEFAULT '{}'::text[],
  experience         VARCHAR(100),
  date_of_join       DATE,
  description        TEXT,
  created_by         VARCHAR(100),
  profile_image      TEXT,
  identity_document  TEXT,
  status             VARCHAR(100),
  employee_code      VARCHAR(100),
  created_at         TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 3. EXTERNAL LEADS TABLE
-- Synced lead records from the main Sales database (Redangle)
-- Tracks the current phase of each client booking
-- ============================================================
CREATE TABLE IF NOT EXISTS external_leads (
  id                    SERIAL PRIMARY KEY,
  external_id           VARCHAR(100) UNIQUE NOT NULL,
  lead_serial_number    VARCHAR(100),
  lead_name             VARCHAR(255),
  email                 VARCHAR(255),
  phone                 VARCHAR(50),
  location              VARCHAR(255),
  event_type            VARCHAR(100),
  event_date            DATE,
  priority              VARCHAR(50),
  invoice_id            INTEGER,
  discount              NUMERIC,
  invoice_total         NUMERIC,
  invoice_paid          NUMERIC,
  invoice_balance       NUMERIC,
  invoice_data          JSONB,
  status                VARCHAR(50),
  flow_type             VARCHAR(20),
  current_phase         VARCHAR(30) DEFAULT 'not_started',
  phase_status          VARCHAR(20) DEFAULT 'not_started',
  phase_owner           VARCHAR(30),
  pre_production_step   VARCHAR(20) DEFAULT 'shoot',
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 4. EVENT DETAILS TABLE
-- Full event-specific details per lead including media upload
-- links, delivery methods, and runtime tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS event_details (
  id                              SERIAL PRIMARY KEY,
  external_lead_id                VARCHAR(100) UNIQUE NOT NULL,
  client_name                     VARCHAR(255),
  email                           VARCHAR(255),
  phone                           VARCHAR(50),
  contact_person_name             VARCHAR(255),
  contact_person_number           VARCHAR(50),
  event_type                      VARCHAR(255),
  event_location                  TEXT,
  preferred_date                  DATE,
  preferred_time                  TIME,
  budget_range                    VARCHAR(255),
  services                        TEXT,
  deliverables                    TEXT,
  invoice_attached                TEXT,
  meeting_type                    VARCHAR(100),
  meeting_details                 TEXT,
  client_requirements             TEXT,
  priority_level                  VARCHAR(50),
  -- Photo upload fields
  drive_link                      TEXT,
  camera_used                     VARCHAR(255),
  num_images                      INTEGER DEFAULT 0,
  upload_notes                    TEXT,
  cr3_other_reason                TEXT,
  first_clip_base64               TEXT,
  last_clip_base64                TEXT,
  photo_delivery_method           VARCHAR(20),
  photo_hard_disk_delivery_date   DATE,
  photo_hard_disk_received        BOOLEAN DEFAULT FALSE,
  photo_upload_phase              VARCHAR(30),
  -- Video upload fields
  video_drive_link                TEXT,
  video_camera_used               TEXT,
  num_videos                      INTEGER DEFAULT 0,
  video_upload_notes              TEXT,
  video_included_file_format      VARCHAR(50),
  post_production_priority        VARCHAR(50),
  video_delivery_method           VARCHAR(20),
  video_hard_disk_delivery_date   DATE,
  video_hard_disk_received        BOOLEAN DEFAULT FALSE,
  video_upload_phase              VARCHAR(30),
  -- Drone upload fields
  drone_photo_drive_link          TEXT,
  drone_video_drive_link          TEXT,
  drone_camera_used               TEXT,
  drone_video_camera_used         TEXT,
  drone_num_images                INTEGER,
  drone_num_videos                INTEGER,
  drone_upload_notes              TEXT,
  drone_video_upload_notes        TEXT,
  drone_delivery_method           VARCHAR(20),
  drone_hard_disk_delivery_date   DATE,
  drone_hard_disk_received        BOOLEAN DEFAULT FALSE,
  drone_upload_phase              VARCHAR(30),
  -- Pre-production editor submission fields
  save_the_date_drive_link        TEXT,
  save_the_date_upload_notes      TEXT,
  save_the_date_submission_status VARCHAR(50),
  save_the_date_reupload_remarks  TEXT,
  save_the_video_drive_link       TEXT,
  save_the_video_upload_notes     TEXT,
  save_the_video_submission_status VARCHAR(50),
  save_the_video_reupload_remarks TEXT,
  retouch_drive_link              TEXT,
  retouch_upload_notes            TEXT,
  retouch_submission_status       VARCHAR(50),
  retouch_reupload_remarks        TEXT,
  -- Event runtime tracking
  event_status                    VARCHAR(20) DEFAULT 'not_started',
  event_started_at                TIMESTAMP,
  event_paused_at                 TIMESTAMP,
  event_ended_at                  TIMESTAMP,
  event_started_by                VARCHAR(100),
  -- Media & misc
  media_status                    VARCHAR(50) DEFAULT 'Pending',
  invitation_upload               TEXT,
  event_service_details           JSONB,
  created_at                      TIMESTAMP DEFAULT NOW(),
  updated_at                      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 5. ASSIGN TEAMS TABLE
-- Maps which employee handles each role per lead
-- Covers pre-production shoot, event day, and editing teams
-- ============================================================
CREATE TABLE IF NOT EXISTS assign_teams (
  id                            SERIAL PRIMARY KEY,
  external_lead_id              VARCHAR(100) UNIQUE NOT NULL,
  -- Pre-production editors
  save_the_date                 VARCHAR(100),
  save_the_video                VARCHAR(100),
  retouch                       VARCHAR(100),
  -- Pre-production shoot team
  photographer                  VARCHAR(100),
  videographer                  VARCHAR(100),
  drone                         VARCHAR(100),
  assistant                     VARCHAR(100),
  editor                        VARCHAR(100),
  secondary_photographer        JSONB DEFAULT '[]'::jsonb,
  secondary_videographer        JSONB DEFAULT '[]'::jsonb,
  secondary_drone               JSONB DEFAULT '[]'::jsonb,
  additional_staff              JSONB DEFAULT '[]'::jsonb,
  -- Pre-production shoot schedule
  event_date                    DATE,
  event_time                    TIME,
  location                      TEXT,
  -- Event day team
  event_photographer            VARCHAR(100),
  event_videographer            VARCHAR(100),
  event_drone                   VARCHAR(100),
  event_secondary_photographer  JSONB DEFAULT '[]'::jsonb,
  event_secondary_videographer  JSONB DEFAULT '[]'::jsonb,
  event_secondary_drone         JSONB DEFAULT '[]'::jsonb,
  event_additional_staff        JSONB DEFAULT '[]'::jsonb,
  event_assignment_date         DATE,
  event_assignment_time         TIME,
  event_assignment_location     TEXT,
  -- Acceptance tracking
  accepted                      BOOLEAN DEFAULT FALSE,
  accepted_by_employees         JSONB DEFAULT '[]'::jsonb,
  accepted_assignments          JSONB DEFAULT '[]'::jsonb,
  shoot_locations               JSONB DEFAULT '[]'::jsonb,
  created_at                    TIMESTAMP DEFAULT NOW(),
  updated_at                    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 6. LEAD TRACKING STAGES TABLE
-- Records which workflow stages each lead has passed through
-- ============================================================
CREATE TABLE IF NOT EXISTS lead_tracking_stages (
  external_lead_id  VARCHAR(100) NOT NULL,
  stage_name        VARCHAR(100) NOT NULL,
  created_at        TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (external_lead_id, stage_name)
);

-- ============================================================
-- 7. ASSIGNED PROJECTS TABLE
-- Tracks editing/post-production work assignments per employee
-- Each row = one employee assigned to one project type
-- ============================================================
CREATE TABLE IF NOT EXISTS assigned_projects (
  id             SERIAL PRIMARY KEY,
  project_id     VARCHAR(100) NOT NULL,
  project_name   VARCHAR(255) NOT NULL,
  project_type   VARCHAR(100),
  employee_id    VARCHAR(100) NOT NULL,
  status         VARCHAR(50) DEFAULT 'Pending',
  upload_link    TEXT,
  upload_notes   TEXT,
  admin_notes    TEXT,
  reference_link TEXT,
  submit_selection TEXT,
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW(),
  CONSTRAINT assigned_projects_unique_assignment UNIQUE (project_id, employee_id, project_type)
);

-- ============================================================
-- 8. EMPLOYEE WORK RUNTIME SESSIONS TABLE
-- Time-tracking per employee per project per day
-- ============================================================
CREATE TABLE IF NOT EXISTS employee_work_runtime_sessions (
  id                   SERIAL PRIMARY KEY,
  assigned_project_id  INTEGER NOT NULL,
  project_id           VARCHAR(100) NOT NULL,
  employee_id          VARCHAR(100) NOT NULL,
  project_type         VARCHAR(100),
  work_date            DATE NOT NULL,
  status               VARCHAR(20) NOT NULL DEFAULT 'not_started',
  started_at           TIMESTAMP,
  paused_at            TIMESTAMP,
  ended_at             TIMESTAMP,
  accumulated_seconds  INTEGER NOT NULL DEFAULT 0,
  started_by           VARCHAR(100),
  ended_by             VARCHAR(100),
  created_at           TIMESTAMP DEFAULT NOW(),
  updated_at           TIMESTAMP DEFAULT NOW(),
  UNIQUE (assigned_project_id, work_date)
);

-- ============================================================
-- 9. APPROVED DRIVE LINKS TABLE
-- Admin-approved output links ready to send to clients
-- ============================================================
CREATE TABLE IF NOT EXISTS approved_drive_links (
  id              SERIAL PRIMARY KEY,
  project_id      VARCHAR(100) NOT NULL,
  project_name    VARCHAR(255),
  project_type    VARCHAR(100),
  employee_id     VARCHAR(100),
  upload_link     TEXT NOT NULL,
  admin_notes     TEXT,
  approved_by     VARCHAR(100),
  approved_at     TIMESTAMP DEFAULT NOW(),
  sent_to_client  BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 10. CRM FINAL APPROVALS TABLE
-- QC checklist and approval state per project
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_final_approvals (
  id              SERIAL PRIMARY KEY,
  project_id      VARCHAR(100) UNIQUE NOT NULL,
  checked_items   INTEGER[] DEFAULT '{}'::integer[],
  rework_notes    TEXT,
  review_status   VARCHAR(50) DEFAULT 'pending_review',
  change_source   VARCHAR(20),
  change_notes    TEXT,
  assigned_to     VARCHAR(255),
  approved_at     TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 11. PIXOFFICE ENTRIES TABLE
-- Data manager entries for Pixoffice delivery tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS pixoffice_entries (
  id                SERIAL PRIMARY KEY,
  external_lead_id  INT,
  event_name        VARCHAR(100) NOT NULL,
  sub_category      VARCHAR(100),
  services          JSONB,
  file_size         VARCHAR(50),
  storage_path      VARCHAR(255),
  qc_status         VARCHAR(50) DEFAULT 'Pending',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 12. PASSWORD RESET OTPS TABLE
-- One-time passwords for email-based password reset flow
-- ============================================================
CREATE TABLE IF NOT EXISTS password_reset_otps (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) NOT NULL,
  otp_code    VARCHAR(6) NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  is_used     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 13. EMPLOYEE LEAVE REQUESTS TABLE
-- Leave applications submitted by employees
-- ============================================================
CREATE TABLE IF NOT EXISTS employee_leave_requests (
  leave_request_id  SERIAL PRIMARY KEY,
  employee_id       VARCHAR(50) NOT NULL,
  leave_type        VARCHAR(50) NOT NULL,
  from_date         DATE NOT NULL,
  to_date           DATE NOT NULL,
  no_of_days        INTEGER,
  status            VARCHAR(20) DEFAULT 'Pending',
  reason            TEXT,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 14. EVENT RUNTIME SESSIONS TABLE
-- Time-tracking for the event coordinator during event day
-- ============================================================
CREATE TABLE IF NOT EXISTS event_runtime_sessions (
  id                   SERIAL PRIMARY KEY,
  external_lead_id     VARCHAR(100) NOT NULL,
  work_date            DATE NOT NULL,
  status               VARCHAR(20) NOT NULL DEFAULT 'not_started',
  started_at           TIMESTAMP,
  paused_at            TIMESTAMP,
  ended_at             TIMESTAMP,
  accumulated_seconds  INTEGER NOT NULL DEFAULT 0,
  started_by           VARCHAR(100),
  ended_by             VARCHAR(100),
  created_at           TIMESTAMP DEFAULT NOW(),
  updated_at           TIMESTAMP DEFAULT NOW(),
  UNIQUE (external_lead_id, work_date)
);

-- ============================================================
-- 15. HARD DISK CLOSURES TABLE
-- Tracks physical hard disk handover and return for media
-- ============================================================
CREATE TABLE IF NOT EXISTS hard_disk_closures (
  id                     SERIAL PRIMARY KEY,
  external_lead_id       VARCHAR(100) UNIQUE,
  handover_disk_number   VARCHAR(100),
  handover_disk_label    VARCHAR(100),
  handover_date          DATE,
  handover_person        VARCHAR(100),
  handover_notes         TEXT,
  receive_disk_number    VARCHAR(100),
  receive_disk_label     VARCHAR(100),
  receive_date           DATE,
  receive_person         VARCHAR(100),
  receive_notes          TEXT,
  status                 VARCHAR(50) DEFAULT 'Pending',
  created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 16. CLIENT DELIVERIES TABLE
-- Tracks what drive links have been shared with clients
-- ============================================================
CREATE TABLE IF NOT EXISTS client_deliveries (
  id                      SERIAL PRIMARY KEY,
  lead_id                 INTEGER NOT NULL,
  delivery_type           VARCHAR(50) NOT NULL,
  drive_link              TEXT,
  video_drive_link        TEXT,
  drone_photo_drive_link  TEXT,
  drone_video_drive_link  TEXT,
  status                  VARCHAR(50) NOT NULL DEFAULT 'pending',
  notes                   TEXT,
  query_count             INTEGER NOT NULL DEFAULT 0,
  created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 17. EMPLOYEES ATTENDANCE TABLE
-- Daily attendance records for all employees
-- ============================================================
CREATE TABLE IF NOT EXISTS employees_attendance (
  attendance_id  SERIAL PRIMARY KEY,
  employee_id    INTEGER NOT NULL,
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in       TIMESTAMP,
  check_out      TIMESTAMP,
  status         VARCHAR(20) DEFAULT 'Present',
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW(),
  UNIQUE (employee_id, date)
);

-- ============================================================
-- 18. CREATIVE CONFIRMATIONS TABLE
-- Client creative brief — costume, theme, location, mood
-- ============================================================
CREATE TABLE IF NOT EXISTS creative_confirmations (
  id                    SERIAL PRIMARY KEY,
  external_lead_id      VARCHAR(100) UNIQUE NOT NULL,
  costume_type          VARCHAR(255),
  color_preferences     JSONB DEFAULT '[]'::jsonb,
  costume_requirements  TEXT,
  event_theme           VARCHAR(255),
  mood_description      TEXT,
  reference_images      JSONB DEFAULT '[]'::jsonb,
  base64_images         JSONB DEFAULT '[]'::jsonb,
  location_name         VARCHAR(255),
  location_type         VARCHAR(100),
  google_map_link       TEXT,
  client_approved       BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 19. CREATIVE PLANNINGS TABLE
-- Internal planning notes per lead (equipment, lighting, props)
-- ============================================================
CREATE TABLE IF NOT EXISTS creative_plannings (
  id                  SERIAL PRIMARY KEY,
  external_lead_id    VARCHAR(100) UNIQUE NOT NULL,
  event_list          JSONB DEFAULT '[]'::jsonb,
  equipment_required  JSONB DEFAULT '[]'::jsonb,
  lighting_setup      JSONB DEFAULT '[]'::jsonb,
  props_required      JSONB DEFAULT '[]'::jsonb,
  special_notes       TEXT,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 20. EVENT MEDIA CLIPS TABLE
-- First/last clip samples for photo, video, drone verification
-- ============================================================
CREATE TABLE IF NOT EXISTS event_media_clips (
  external_lead_id  VARCHAR(100) UNIQUE NOT NULL,
  photo_first_clip  TEXT,
  photo_last_clip   TEXT,
  video_first_clip  TEXT,
  video_last_clip   TEXT,
  drone_first_clip  TEXT,
  drone_last_clip   TEXT,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 21. NOTIFICATIONS TABLE
-- System-wide notifications per role or individual employee
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id                  SERIAL PRIMARY KEY,
  type                VARCHAR(100) NOT NULL,
  title               VARCHAR(255) NOT NULL,
  detail              TEXT,
  lead_id             VARCHAR(100),
  from_role           VARCHAR(100),
  from_name           VARCHAR(255),
  target_roles        TEXT[] DEFAULT '{}'::text[],
  issue_type          VARCHAR(100),
  target_employee_id  VARCHAR(50),
  source_stage        VARCHAR(30),
  is_read             BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES — for query performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_external_leads_external_id
  ON external_leads(external_id);

CREATE INDEX IF NOT EXISTS idx_external_leads_phase
  ON external_leads(current_phase, phase_status);

CREATE INDEX IF NOT EXISTS idx_event_details_lead_id
  ON event_details(external_lead_id);

CREATE INDEX IF NOT EXISTS idx_assign_teams_lead_id
  ON assign_teams(external_lead_id);

CREATE INDEX IF NOT EXISTS idx_assigned_projects_employee
  ON assigned_projects(employee_id);

CREATE INDEX IF NOT EXISTS idx_assigned_projects_project
  ON assigned_projects(project_id);

CREATE INDEX IF NOT EXISTS idx_work_runtime_employee
  ON employee_work_runtime_sessions(employee_id, work_date);

CREATE INDEX IF NOT EXISTS idx_attendance_employee_date
  ON employees_attendance(employee_id, date);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee
  ON employee_leave_requests(employee_id);

CREATE INDEX IF NOT EXISTS idx_notifications_target_roles
  ON notifications USING GIN (target_roles);

CREATE INDEX IF NOT EXISTS idx_notifications_target_employee
  ON notifications(target_employee_id);

CREATE INDEX IF NOT EXISTS idx_notifications_source_stage
  ON notifications(source_stage);

CREATE INDEX IF NOT EXISTS idx_hard_disk_closures_lead
  ON hard_disk_closures(external_lead_id);

-- ============================================================
-- VERIFICATION — list all created tables
-- ============================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
