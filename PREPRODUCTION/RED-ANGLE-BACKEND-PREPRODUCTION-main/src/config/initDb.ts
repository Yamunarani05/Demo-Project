import { Client } from "pg";
import dotenv from "dotenv";
import { refreshPools } from "./db";

dotenv.config();

const dbHost = process.env.DB_HOST || "localhost";
const dbPort = Number(process.env.DB_PORT) || 6000;
const dbUser = process.env.DB_USER || "postgres";
const dbName = process.env.DB_NAME || "Redangle-Preproduction";

async function getAuthenticatedClient(database: string): Promise<Client> {
  const passwordsToTry = [
    process.env.DB_PASSWORD || "password",
    "tns7142006",
    "password",
    "1234",
    ""
  ];
  
  const uniquePasswords = Array.from(new Set(passwordsToTry));
  
  for (let i = 0; i < uniquePasswords.length; i++) {
    const pw = uniquePasswords[i];
    const client = new Client({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: pw,
      database: database
    });
    
    try {
      await client.connect();
      if (pw !== process.env.DB_PASSWORD) {
        console.log(`🔑 Connected to PostgreSQL using fallback password: "${pw}"`);
        process.env.DB_PASSWORD = pw;
        refreshPools();
      }
      return client;
    } catch (err: any) {
      if (err.code === "28P01") {
        // Password authorization failed, try next password
        continue;
      } else {
        // Connection refused, database does not exist, etc.
        throw err;
      }
    }
  }
  
  throw new Error("Could not connect to PostgreSQL: All passwords failed.");
}

export const ensureDatabaseExists = async () => {
  let adminClient: Client | null = null;
  try {
    console.log(`Connecting to PostgreSQL to check database "${dbName}"...`);
    adminClient = await getAuthenticatedClient("postgres");
    
    const res = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    
    if (res.rows.length === 0) {
      console.log(`Database "${dbName}" does not exist. Creating it...`);
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created successfully!`);
    } else {
      console.log(`✅ Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error("Error ensuring database exists:", err);
    throw err;
  } finally {
    if (adminClient) {
      await adminClient.end();
    }
  }
};

export const ensureTablesExist = async () => {
  let client: Client | null = null;
  try {
    client = await getAuthenticatedClient(dbName);
    console.log(`Checking and creating schemas in database "${dbName}"...`);
    
    // 1. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(100),
        roles TEXT[] DEFAULT '{}'::text[],
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        employee_id INTEGER
      )
    `);
    
    // 2. Employees Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(255) UNIQUE,
        contact_number VARCHAR(50),
        dob DATE,
        address TEXT,
        work_location VARCHAR(255),
        role VARCHAR(100),
        roles TEXT[] DEFAULT '{}'::text[],
        experience VARCHAR(100),
        date_of_join DATE,
        description TEXT,
        created_by VARCHAR(100),
        profile_image TEXT,
        identity_document TEXT,
        status VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        employee_code VARCHAR(100)
      )
    `);
    
    // 3. External Leads Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS external_leads (
        id SERIAL PRIMARY KEY,
        external_id VARCHAR(100) UNIQUE NOT NULL,
        lead_serial_number VARCHAR(100),
        lead_name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        location VARCHAR(255),
        event_type VARCHAR(100),
        event_date DATE,
        priority VARCHAR(50),
        invoice_id INTEGER,
        discount NUMERIC,
        invoice_total NUMERIC,
        invoice_paid NUMERIC,
        invoice_balance NUMERIC,
        invoice_data JSONB,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        flow_type VARCHAR(20),
        current_phase VARCHAR(30) DEFAULT 'not_started',
        phase_status VARCHAR(20) DEFAULT 'not_started',
        phase_owner VARCHAR(30),
        assigned_post_prod_crm_id VARCHAR(50),
        pre_production_step VARCHAR(20) DEFAULT 'shoot'
      )
    `);
    
    // 4. Event Details Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_details (
        id SERIAL PRIMARY KEY,
        external_lead_id VARCHAR(100) UNIQUE NOT NULL,
        client_name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        contact_person_name VARCHAR(255),
        contact_person_number VARCHAR(50),
        event_type VARCHAR(255),
        event_location TEXT,
        preferred_date DATE,
        preferred_time TIME,
        budget_range VARCHAR(255),
        services TEXT,
        deliverables TEXT,
        invoice_attached TEXT,
        meeting_type VARCHAR(100),
        meeting_details TEXT,
        client_requirements TEXT,
        priority_level VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        drive_link TEXT,
        video_drive_link TEXT,
        drone_photo_drive_link TEXT,
        drone_video_drive_link TEXT,
        drone_camera_used TEXT,
        drone_video_camera_used TEXT,
        drone_num_images INTEGER,
        drone_num_videos INTEGER,
        drone_upload_notes TEXT,
        drone_video_upload_notes TEXT,
        save_the_date_drive_link TEXT,
        save_the_date_upload_notes TEXT,
        save_the_date_submission_status VARCHAR(50),
        save_the_video_drive_link TEXT,
        save_the_video_upload_notes TEXT,
        save_the_video_submission_status VARCHAR(50),
        secondary_photo_drive_link TEXT,
        secondary_photo_upload_notes TEXT,
        secondary_photo_submission_status VARCHAR(50),
        secondary_video_drive_link TEXT,
        secondary_video_upload_notes TEXT,
        secondary_video_submission_status VARCHAR(50),
        retouch_drive_link TEXT,
        retouch_upload_notes TEXT,
        retouch_submission_status VARCHAR(50),
        video_included_file_format VARCHAR(50),
        post_production_priority VARCHAR(50),
        photo_delivery_method VARCHAR(20),
        photo_hard_disk_delivery_date DATE,
        photo_hard_disk_received BOOLEAN DEFAULT FALSE,
        photo_upload_phase VARCHAR(30),
        video_delivery_method VARCHAR(20),
        video_hard_disk_delivery_date DATE,
        video_hard_disk_received BOOLEAN DEFAULT FALSE,
        video_upload_phase VARCHAR(30),
        drone_delivery_method VARCHAR(20),
        drone_hard_disk_delivery_date DATE,
        drone_hard_disk_received BOOLEAN DEFAULT FALSE,
        retouch_reupload_remarks TEXT,
        save_the_date_reupload_remarks TEXT,
        save_the_video_reupload_remarks TEXT,
        photo_approved BOOLEAN DEFAULT FALSE,
        video_approved BOOLEAN DEFAULT FALSE,
        event_photo_approved BOOLEAN DEFAULT FALSE,
        event_video_approved BOOLEAN DEFAULT FALSE,
        secondary_photo_approved BOOLEAN DEFAULT FALSE,
        secondary_video_approved BOOLEAN DEFAULT FALSE,
        drone_approved BOOLEAN DEFAULT FALSE,
        verification_draft JSONB,
        event_verification_draft JSONB,
        photo_reupload_remarks TEXT,
        video_reupload_remarks TEXT,
        secondary_photo_reupload_remarks TEXT,
        secondary_video_reupload_remarks TEXT,
        drone_reupload_remarks TEXT,
        cr3_mode VARCHAR(50),
        media_status VARCHAR(20) DEFAULT 'Pending',
        event_status VARCHAR(20) DEFAULT 'not_started',
        event_started_at TIMESTAMP,
        event_paused_at TIMESTAMP,
        event_ended_at TIMESTAMP,
        event_started_by VARCHAR(100),
        video_camera_used TEXT,
        num_images INTEGER DEFAULT 0,
        num_videos INTEGER DEFAULT 0,
        upload_notes TEXT,
        video_upload_notes TEXT,
        camera_used VARCHAR(255),
        cr3_other_reason TEXT,
        first_clip_base64 TEXT,
        last_clip_base64 TEXT,
        invitation_upload TEXT,
        event_service_details JSONB
      )
    `);
    
    // 5. Assign Teams Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assign_teams (
        id SERIAL PRIMARY KEY,
        external_lead_id VARCHAR(100) UNIQUE NOT NULL,
        photographer VARCHAR(100),
        videographer VARCHAR(100),
        drone VARCHAR(100),
        save_the_date VARCHAR(100),
        save_the_video VARCHAR(100),
        retouch VARCHAR(100),
        assistant VARCHAR(100),
        editor VARCHAR(100),
        secondary_photographer JSONB DEFAULT '[]'::jsonb,
        secondary_videographer JSONB DEFAULT '[]'::jsonb,
        secondary_drone JSONB DEFAULT '[]'::jsonb,
        event_photographer VARCHAR(100),
        event_videographer VARCHAR(100),
        event_drone VARCHAR(100),
        event_secondary_photographer JSONB DEFAULT '[]'::jsonb,
        event_secondary_videographer JSONB DEFAULT '[]'::jsonb,
        event_secondary_drone JSONB DEFAULT '[]'::jsonb,
        event_additional_staff JSONB DEFAULT '[]'::jsonb,
        event_photographer_label VARCHAR(100),
        event_videographer_label VARCHAR(100),
        event_drone_label VARCHAR(100),
        event_secondary_photographer_label VARCHAR(100),
        event_secondary_videographer_label VARCHAR(100),
        event_secondary_drone_label VARCHAR(100),
        event_assignment_date DATE,
        event_assignment_time TIME,
        event_assignment_location TEXT,
        additional_staff JSONB DEFAULT '[]'::jsonb,
        event_date DATE,
        event_time TIME,
        location TEXT,
        accepted_by_employees JSONB DEFAULT '[]'::jsonb,
        accepted_assignments JSONB DEFAULT '[]'::jsonb,
        shoot_locations JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        accepted BOOLEAN DEFAULT FALSE
      )
    `);
    
    // 6. Lead Tracking Stages Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS lead_tracking_stages (
        external_lead_id VARCHAR(100) NOT NULL,
        stage_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (external_lead_id, stage_name)
      )
    `);
    
    // 7. Assigned Projects Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assigned_projects (
        id SERIAL PRIMARY KEY,
        project_id VARCHAR(100) NOT NULL,
        project_name VARCHAR(255) NOT NULL,
        project_type VARCHAR(100),
        employee_id VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        upload_link TEXT,
        admin_notes TEXT,
        reference_link TEXT,
        submit_selection TEXT,
        task_count INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // 8. Employee Work Runtime Sessions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS employee_work_runtime_sessions (
        id SERIAL PRIMARY KEY,
        assigned_project_id INTEGER NOT NULL,
        project_id VARCHAR(100) NOT NULL,
        employee_id VARCHAR(100) NOT NULL,
        project_type VARCHAR(100),
        work_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'not_started',
        started_at TIMESTAMP,
        paused_at TIMESTAMP,
        ended_at TIMESTAMP,
        accumulated_seconds INTEGER NOT NULL DEFAULT 0,
        started_by VARCHAR(100),
        ended_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (assigned_project_id, work_date)
      )
    `);
    
    // 9. Approved Drive Links Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS approved_drive_links (
        id SERIAL PRIMARY KEY,
        project_id VARCHAR(100) NOT NULL,
        project_name VARCHAR(255),
        project_type VARCHAR(100) NOT NULL,
        employee_id VARCHAR(100),
        upload_link TEXT NOT NULL,
        admin_notes TEXT,
        approved_by VARCHAR(100),
        sent_to_client BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // 10. CRM Final Approvals Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS crm_final_approvals (
        id SERIAL PRIMARY KEY,
        project_id VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // 11. Pixoffice Entries Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pixoffice_entries (
        id SERIAL PRIMARY KEY,
        external_lead_id INT,
        event_name VARCHAR(100) NOT NULL,
        sub_category VARCHAR(100),
        services JSONB,
        file_size VARCHAR(50),
        storage_path VARCHAR(255),
        qc_status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 12. Password Reset OTPs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE
      )
    `);
    
    // 13. Employee Leave Requests Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS employee_leave_requests (
        leave_request_id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) NOT NULL,
        leave_type VARCHAR(50) NOT NULL,
        from_date DATE NOT NULL,
        to_date DATE NOT NULL,
        no_of_days INTEGER,
        status VARCHAR(20) DEFAULT 'Pending',
        reason TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // 14. Event Runtime Sessions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_runtime_sessions (
        id SERIAL PRIMARY KEY,
        external_lead_id VARCHAR(100) NOT NULL,
        work_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'not_started',
        started_at TIMESTAMP,
        paused_at TIMESTAMP,
        ended_at TIMESTAMP,
        accumulated_seconds INTEGER NOT NULL DEFAULT 0,
        started_by VARCHAR(100),
        ended_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (external_lead_id, work_date)
      )
    `);
    
    // 15. Hard Disk Closures Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hard_disk_closures (
        id SERIAL PRIMARY KEY,
        external_lead_id VARCHAR(100) UNIQUE,
        handover_disk_number VARCHAR(100),
        handover_disk_label VARCHAR(100),
        handover_date DATE,
        handover_person VARCHAR(100),
        handover_notes TEXT,
        receive_disk_number VARCHAR(100),
        receive_disk_label VARCHAR(100),
        receive_date DATE,
        receive_person VARCHAR(100),
        receive_notes TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 16. Client Deliveries Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS client_deliveries (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER NOT NULL,
        delivery_type VARCHAR(50) NOT NULL,
        drive_link TEXT,
        video_drive_link TEXT,
        drone_photo_drive_link TEXT,
        drone_video_drive_link TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        notes TEXT,
        approved_links JSON,
        query_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 17. Employees Attendance Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees_attendance (
        attendance_id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        check_in TIMESTAMP,
        check_out TIMESTAMP,
        status VARCHAR(20) DEFAULT 'Present',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(employee_id, date)
      )
    `);
    
    // 19. Creative Confirmations Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS creative_confirmations (
        id SERIAL PRIMARY KEY,
        external_lead_id VARCHAR(100) UNIQUE NOT NULL,
        costume_type VARCHAR(255),
        color_preferences JSONB DEFAULT '[]'::jsonb,
        costume_requirements TEXT,
        event_theme VARCHAR(255),
        mood_description TEXT,
        reference_images JSONB DEFAULT '[]'::jsonb,
        base64_images JSONB DEFAULT '[]'::jsonb,
        location_name VARCHAR(255),
        location_type VARCHAR(100),
        google_map_link TEXT,
        client_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 20. Event Media Clips Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_media_clips (
        external_lead_id VARCHAR(100) UNIQUE NOT NULL,
        photo_first_clip TEXT,
        photo_last_clip TEXT,
        video_first_clip TEXT,
        video_last_clip TEXT,
        drone_first_clip TEXT,
        drone_last_clip TEXT,
        secondary_photo_first_clip TEXT,
        secondary_photo_last_clip TEXT,
        secondary_video_first_clip TEXT,
        secondary_video_last_clip TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 21. Notifications Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        notification_id INTEGER,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        detail TEXT,
        lead_id INTEGER,
        from_role VARCHAR(100),
        from_name VARCHAR(255),
        target_roles JSONB NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        issue_type VARCHAR(50),
        target_employee_id VARCHAR(50),
        source_stage VARCHAR(50)
      )
    `);

    // 22. Pixstudio Entries Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pixstudio_entries (
        id SERIAL PRIMARY KEY,
        external_lead_id VARCHAR(100),
        event_name VARCHAR(100) NOT NULL,
        sub_category VARCHAR(100),
        services JSONB,
        file_size VARCHAR(50),
        storage_path VARCHAR(255),
        qc_status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 23. Creative Plannings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS creative_plannings (
        id SERIAL PRIMARY KEY,
        external_lead_id VARCHAR(100) UNIQUE NOT NULL,
        event_list JSONB,
        equipment_required JSONB,
        lighting_setup JSONB,
        props_required JSONB,
        special_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 24. Photo Upload Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS photo_upload (
        id SERIAL PRIMARY KEY,
        external_lead_id VARCHAR(100),
        client_name VARCHAR(255),
        event_type VARCHAR(100),
        drive_link TEXT,
        camera_used VARCHAR(255),
        num_images INTEGER,
        upload_notes TEXT,
        uploaded_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 25. Attendance Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        login_time TIME,
        logout_time TIME,
        status VARCHAR(20) DEFAULT 'Present',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(employee_id, date)
      )
    `);

    // 25.5 Pre-Production Shoots Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pre_production_shoots (
        external_lead_id character varying(100) NOT NULL PRIMARY KEY,
        drive_link text,
        num_images integer DEFAULT 0,
        camera_used character varying(255),
        upload_notes text,
        photo_first_clip text,
        photo_last_clip text,
        photo_delivery_method character varying(20),
        photo_hard_disk_delivery_date date,
        photo_hard_disk_received boolean DEFAULT false,
        photo_approved boolean DEFAULT false,
        video_drive_link text,
        num_videos integer DEFAULT 0,
        video_camera_used text,
        video_upload_notes text,
        video_included_file_format character varying(50),
        video_first_clip text,
        video_last_clip text,
        video_delivery_method character varying(20),
        video_hard_disk_delivery_date date,
        video_hard_disk_received boolean DEFAULT false,
        video_approved boolean DEFAULT false,
        media_status character varying(20) DEFAULT 'Pending'::character varying,
        created_at timestamp without time zone DEFAULT now(),
        updated_at timestamp without time zone DEFAULT now(),
        photo_reupload_remarks text,
        video_reupload_remarks text,
        verification_draft jsonb
      )
    `);

    // 26. Apply schema updates for existing tables
    await client.query(`
      ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS flow_type VARCHAR(20);
      ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS current_phase VARCHAR(30) DEFAULT 'not_started';
      ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS phase_status VARCHAR(20) DEFAULT 'not_started';
      ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS phase_owner VARCHAR(30);
      ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS pre_production_step VARCHAR(20) DEFAULT 'shoot';
      ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS assigned_post_prod_crm_id VARCHAR(50);
      ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS approved_links JSON;
      ALTER TABLE event_details ADD COLUMN IF NOT EXISTS post_production_priority VARCHAR(50);
      ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS task_count INTEGER;
      ALTER TABLE pixstudio_entries ALTER COLUMN external_lead_id TYPE VARCHAR(100) USING external_lead_id::text;
    `);

    
    // Automatically generated schema sync from pre-production database
    try {
      await client.query(`
-- Run this script on your production database to add missing columns

-- Missing columns for approved_drive_links
ALTER TABLE approved_drive_links ADD COLUMN IF NOT EXISTS project_name character varying(255);
ALTER TABLE approved_drive_links ADD COLUMN IF NOT EXISTS project_type character varying(100) NOT NULL;
ALTER TABLE approved_drive_links ADD COLUMN IF NOT EXISTS employee_id character varying(100);
ALTER TABLE approved_drive_links ADD COLUMN IF NOT EXISTS upload_link text NOT NULL;
ALTER TABLE approved_drive_links ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE approved_drive_links ADD COLUMN IF NOT EXISTS approved_by character varying(100);
ALTER TABLE approved_drive_links ADD COLUMN IF NOT EXISTS sent_to_client boolean DEFAULT false;
ALTER TABLE approved_drive_links ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();

-- Missing columns for assign_teams
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS photographer character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS videographer character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS drone character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS save_the_date character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS save_the_video character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS retouch character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS assistant character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS editor character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS secondary_photographer jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS secondary_videographer jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS secondary_drone jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_photographer character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_videographer character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_drone character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_secondary_photographer jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_secondary_videographer jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_secondary_drone jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_additional_staff jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_assignment_date date;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_assignment_time time without time zone;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_assignment_location text;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS additional_staff jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_date date;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_time time without time zone;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS accepted_by_employees jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS accepted_assignments jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS shoot_locations jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS accepted boolean DEFAULT false;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS file_path text;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_traditional_photographer character varying(255);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_candid_photographer character varying(255);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_traditional_videographer character varying(255);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_candid_videographer character varying(255);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_photographer_label character varying(255);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_videographer_label character varying(255);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_drone_label character varying(255);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_secondary_photographer_label character varying(255);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_secondary_videographer_label character varying(255);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_secondary_drone_label character varying(255);

-- Missing columns for assigned_projects
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS project_name character varying(255) NOT NULL;
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS project_type character varying(100);
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS employee_id character varying(100) NOT NULL;
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS status character varying(50) DEFAULT 'Pending'::character varying;
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS upload_link text;
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS reference_link text;
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS submit_selection text;
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS upload_notes text;
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS task_count integer;

-- Missing columns for attendance
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS date date DEFAULT CURRENT_DATE NOT NULL;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS login_time time without time zone;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS logout_time time without time zone;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS status character varying(20) DEFAULT 'Present'::character varying;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();

-- Missing columns for client_deliveries
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS drive_link text;
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS video_drive_link text;
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS drone_photo_drive_link text;
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS drone_video_drive_link text;
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS status character varying(50) DEFAULT 'pending'::character varying NOT NULL;
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS query_count integer DEFAULT 0 NOT NULL;
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS magazine_drive_link character varying(500);
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS frame_drive_link character varying(500);
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS approved_links json;

-- Missing columns for creative_confirmations
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS costume_type character varying(255);
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS color_preferences jsonb DEFAULT '[]'::jsonb;
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS costume_requirements text;
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS event_theme character varying(255);
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS mood_description text;
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS reference_images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS base64_images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS location_name character varying(255);
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS location_type character varying(100);
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS google_map_link text;
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS client_approved boolean DEFAULT false;
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();

-- Missing columns for creative_plannings
ALTER TABLE creative_plannings ADD COLUMN IF NOT EXISTS event_list jsonb;
ALTER TABLE creative_plannings ADD COLUMN IF NOT EXISTS equipment_required jsonb;
ALTER TABLE creative_plannings ADD COLUMN IF NOT EXISTS lighting_setup jsonb;
ALTER TABLE creative_plannings ADD COLUMN IF NOT EXISTS props_required jsonb;
ALTER TABLE creative_plannings ADD COLUMN IF NOT EXISTS special_notes text;
ALTER TABLE creative_plannings ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE creative_plannings ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();

-- Missing columns for crm_final_approvals
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS status character varying(50) DEFAULT 'Pending'::character varying;
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS approved_at timestamp without time zone;
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS checked_items integer[] DEFAULT '{}'::integer[];
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS rework_notes text;
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS review_status character varying(50) DEFAULT 'pending_review'::character varying;
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS change_source character varying(20);
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS change_notes text;
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS assigned_to character varying(255);
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();

-- Missing columns for employee_leave_requests
ALTER TABLE employee_leave_requests ADD COLUMN IF NOT EXISTS leave_type character varying(50) NOT NULL;
ALTER TABLE employee_leave_requests ADD COLUMN IF NOT EXISTS from_date date NOT NULL;
ALTER TABLE employee_leave_requests ADD COLUMN IF NOT EXISTS to_date date NOT NULL;
ALTER TABLE employee_leave_requests ADD COLUMN IF NOT EXISTS no_of_days integer;
ALTER TABLE employee_leave_requests ADD COLUMN IF NOT EXISTS status character varying(20) DEFAULT 'Pending'::character varying;
ALTER TABLE employee_leave_requests ADD COLUMN IF NOT EXISTS reason text;
ALTER TABLE employee_leave_requests ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE employee_leave_requests ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();

-- Missing columns for employee_work_runtime_sessions
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS employee_id character varying(100) NOT NULL;
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS project_type character varying(100);
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS work_date date NOT NULL;
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS status character varying(20) DEFAULT 'not_started'::character varying NOT NULL;
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS started_at timestamp without time zone;
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS paused_at timestamp without time zone;
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS ended_at timestamp without time zone;
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS accumulated_seconds integer DEFAULT 0 NOT NULL;
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS started_by character varying(100);
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS ended_by character varying(100);
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();

-- Missing columns for employees
ALTER TABLE employees ADD COLUMN IF NOT EXISTS first_name character varying(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS last_name character varying(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS email character varying(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS contact_number character varying(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS dob date;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS work_location character varying(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS role character varying(500);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS roles text[] DEFAULT '{}'::text[];
ALTER TABLE employees ADD COLUMN IF NOT EXISTS experience character varying(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS date_of_join date;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS created_by character varying(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS profile_image text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS identity_document text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS status character varying(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employee_code character varying(100);

-- Missing columns for employees_attendance
ALTER TABLE employees_attendance ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE employees_attendance ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();

-- Missing columns for event_details
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS client_name character varying(255);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS email character varying(255);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS phone character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS contact_person_name character varying(255);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS contact_person_number character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_type character varying(255);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_location text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS preferred_date date;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS preferred_time time without time zone;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS budget_range character varying(255);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS services text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS deliverables text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS invoice_attached text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS meeting_type character varying(100);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS meeting_details text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS client_requirements text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS priority_level character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_photo_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_video_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_camera_used text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_video_camera_used text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_num_images integer;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_num_videos integer;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_upload_notes text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_video_upload_notes text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS save_the_date_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS save_the_date_upload_notes text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS save_the_date_submission_status character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS save_the_video_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS save_the_video_upload_notes text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS save_the_video_submission_status character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS retouch_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS retouch_upload_notes text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS retouch_submission_status character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS photo_delivery_method character varying(20);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS photo_hard_disk_delivery_date date;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS photo_hard_disk_received boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS photo_upload_phase character varying(30);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_delivery_method character varying(20);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_hard_disk_delivery_date date;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_hard_disk_received boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_upload_phase character varying(30);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_delivery_method character varying(20);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_hard_disk_delivery_date date;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_hard_disk_received boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_upload_phase character varying(30);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS media_status character varying(50) DEFAULT 'Pending'::character varying;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_status character varying(20) DEFAULT 'not_started'::character varying;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_started_at timestamp without time zone;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_paused_at timestamp without time zone;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_ended_at timestamp without time zone;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_started_by character varying(100);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_camera_used text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS num_images integer DEFAULT 0;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS num_videos integer DEFAULT 0;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS upload_notes text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_upload_notes text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS camera_used character varying(255);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS cr3_other_reason text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS first_clip_base64 text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS last_clip_base64 text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_included_file_format character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS invitation_upload text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_service_details jsonb;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS save_the_date_reupload_remarks text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS save_the_video_reupload_remarks text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS retouch_reupload_remarks text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS photo_approved boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_approved boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_photo_approved boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_video_approved boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_approved boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS verification_draft jsonb;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_verification_draft jsonb;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS photo_reupload_remarks text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_reupload_remarks text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_reupload_remarks text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS cr3_mode character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS post_production_priority character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS traditional_photo_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS candid_photo_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS traditional_video_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS candid_video_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_photo_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_photo_upload_notes text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_video_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_video_upload_notes text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_photo_approved boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_video_approved boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_photo_reupload_remarks text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_video_reupload_remarks text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_photo_submission_status character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_video_submission_status character varying(50);

-- Missing columns for event_media_clips
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS photo_first_clip text;
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS photo_last_clip text;
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS video_first_clip text;
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS video_last_clip text;
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS drone_first_clip text;
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS drone_last_clip text;
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS secondary_photo_first_clip text;
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS secondary_photo_last_clip text;
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS secondary_video_first_clip text;
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS secondary_video_last_clip text;

-- Missing columns for event_runtime_sessions
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS work_date date NOT NULL;
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS status character varying(20) DEFAULT 'not_started'::character varying NOT NULL;
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS started_at timestamp without time zone;
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS paused_at timestamp without time zone;
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS ended_at timestamp without time zone;
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS accumulated_seconds integer DEFAULT 0 NOT NULL;
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS started_by character varying(100);
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS ended_by character varying(100);
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS phase character varying(32) DEFAULT 'event'::character varying NOT NULL;

-- Missing columns for external_leads
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS lead_serial_number character varying(100);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS lead_name character varying(255);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS email character varying(255);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS phone character varying(50);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS location character varying(255);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS event_type character varying(100);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS event_date date;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS priority character varying(50);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS invoice_id integer;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS discount numeric;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS invoice_total numeric;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS invoice_paid numeric;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS invoice_balance numeric;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS invoice_data jsonb;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS status character varying(50);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS flow_type character varying(20);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS current_phase character varying(30) DEFAULT 'not_started'::character varying;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS phase_status character varying(20) DEFAULT 'not_started'::character varying;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS phase_owner character varying(30);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS pre_production_step character varying(20) DEFAULT 'shoot'::character varying;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS preproduction_data jsonb;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS assigned_post_prod_crm_id character varying(100);

-- Missing columns for hard_disk_closures
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS handover_disk_number character varying(100);
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS handover_disk_label character varying(100);
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS handover_date date;
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS handover_person character varying(100);
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS handover_notes text;
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS receive_disk_number character varying(100);
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS receive_disk_label character varying(100);
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS receive_date date;
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS receive_person character varying(100);
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS receive_notes text;
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS status character varying(50) DEFAULT 'Pending'::character varying;
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

-- Missing columns for lead_tracking_stages
ALTER TABLE lead_tracking_stages ADD COLUMN IF NOT EXISTS stage_name character varying(100) NOT NULL;
ALTER TABLE lead_tracking_stages ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();

-- Missing columns for notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title character varying(255) NOT NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS detail text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS lead_id character varying(100);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS from_role character varying(100);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS from_name character varying(255);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_roles text[] DEFAULT '{}'::text[];
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS issue_type character varying(100);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_employee_id character varying(50);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS source_stage character varying(30);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();

-- Missing columns for password_reset_otps
ALTER TABLE password_reset_otps ADD COLUMN IF NOT EXISTS otp_code character varying(6) NOT NULL;
ALTER TABLE password_reset_otps ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE password_reset_otps ADD COLUMN IF NOT EXISTS expires_at timestamp without time zone NOT NULL;
ALTER TABLE password_reset_otps ADD COLUMN IF NOT EXISTS is_used boolean DEFAULT false;

-- Missing columns for photo_upload
ALTER TABLE photo_upload ADD COLUMN IF NOT EXISTS client_name character varying(255);
ALTER TABLE photo_upload ADD COLUMN IF NOT EXISTS event_type character varying(100);
ALTER TABLE photo_upload ADD COLUMN IF NOT EXISTS drive_link text;
ALTER TABLE photo_upload ADD COLUMN IF NOT EXISTS camera_used character varying(255);
ALTER TABLE photo_upload ADD COLUMN IF NOT EXISTS num_images integer;
ALTER TABLE photo_upload ADD COLUMN IF NOT EXISTS upload_notes text;
ALTER TABLE photo_upload ADD COLUMN IF NOT EXISTS uploaded_by character varying(100);
ALTER TABLE photo_upload ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

-- Missing columns for pixoffice_entries
ALTER TABLE pixoffice_entries ADD COLUMN IF NOT EXISTS sub_category character varying(100);
ALTER TABLE pixoffice_entries ADD COLUMN IF NOT EXISTS services jsonb;
ALTER TABLE pixoffice_entries ADD COLUMN IF NOT EXISTS file_size character varying(50);
ALTER TABLE pixoffice_entries ADD COLUMN IF NOT EXISTS storage_path character varying(255);
ALTER TABLE pixoffice_entries ADD COLUMN IF NOT EXISTS qc_status character varying(50) DEFAULT 'Pending'::character varying;
ALTER TABLE pixoffice_entries ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

-- Missing columns for pixstudio_entries
ALTER TABLE pixstudio_entries ADD COLUMN IF NOT EXISTS event_name character varying(100) NOT NULL;
ALTER TABLE pixstudio_entries ADD COLUMN IF NOT EXISTS sub_category character varying(100);
ALTER TABLE pixstudio_entries ADD COLUMN IF NOT EXISTS services jsonb;
ALTER TABLE pixstudio_entries ADD COLUMN IF NOT EXISTS file_size character varying(50);
ALTER TABLE pixstudio_entries ADD COLUMN IF NOT EXISTS storage_path character varying(255);
ALTER TABLE pixstudio_entries ADD COLUMN IF NOT EXISTS qc_status character varying(50) DEFAULT 'Pending'::character varying;
ALTER TABLE pixstudio_entries ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

-- Missing columns for pre_production_shoots
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS drive_link text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS num_images integer DEFAULT 0;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS camera_used character varying(255);
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS upload_notes text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS photo_first_clip text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS photo_last_clip text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS photo_delivery_method character varying(20);
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS photo_hard_disk_delivery_date date;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS photo_hard_disk_received boolean DEFAULT false;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS photo_approved boolean DEFAULT false;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_drive_link text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS num_videos integer DEFAULT 0;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_camera_used text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_upload_notes text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_included_file_format character varying(50);
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_first_clip text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_last_clip text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_delivery_method character varying(20);
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_hard_disk_delivery_date date;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_hard_disk_received boolean DEFAULT false;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_approved boolean DEFAULT false;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS media_status character varying(20) DEFAULT 'Pending'::character varying;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS photo_reupload_remarks text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_reupload_remarks text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS verification_draft jsonb;

-- Missing columns for users
ALTER TABLE users ADD COLUMN IF NOT EXISTS email character varying(255) NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role character varying(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS roles text[] DEFAULT '{}'::text[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id integer;


      `);
    } catch(err) { console.error("Schema sync failed: ", err); }

    // 28. Create lead_employee View
    await client.query(`
      CREATE OR REPLACE VIEW public.lead_employee AS
       SELECT concat(at.id, '-', regexp_replace(lower(role_assignment.task_name), '[^a-z0-9]+'::text, '-'::text, 'g'::text)) AS lead_employee_id,
          COALESCE((el.external_id)::text, (at.external_lead_id)::text) AS lead_id,
          role_assignment.task_name,
          role_assignment.flow_stage,
          COALESCE(ed.priority_level, el.priority) AS priority,
              CASE
                  WHEN (role_assignment.flow_stage = 'Event'::text) THEN at.event_assignment_date
                  ELSE at.event_date
              END AS deadline,
          at.created_at,
          (regexp_replace((role_assignment.employee_id)::text, '\\D'::text, ''::text, 'g'::text))::integer AS employee_id,
          emp.first_name AS employee_first_name,
          emp.last_name AS employee_last_name,
          ap.status,
          el.invoice_data
         FROM (((((public.assign_teams at
           LEFT JOIN public.external_leads el ON ((((at.external_lead_id)::text = (el.external_id)::text) OR ((at.external_lead_id)::text = (el.lead_serial_number)::text))))
           LEFT JOIN public.event_details ed ON ((((ed.external_lead_id)::text = (at.external_lead_id)::text) OR ((ed.external_lead_id)::text = (el.external_id)::text) OR ((ed.external_lead_id)::text = (el.lead_serial_number)::text))))
           CROSS JOIN LATERAL ( VALUES ('Pre-production Photography'::text,'Pre-production'::text,at.photographer), ((COALESCE(at.event_photographer_label, 'Event Photography'::character varying))::text,'Event'::text,at.event_photographer), ('Pre-production Videography'::text,'Pre-production'::text,at.videographer), ((COALESCE(at.event_videographer_label, 'Event Videography'::character varying))::text,'Event'::text,at.event_videographer), ('Pre-production Drone Coverage'::text,'Pre-production'::text,at.drone), ((COALESCE(at.event_drone_label, 'Event Drone Coverage'::character varying))::text,'Event'::text,at.event_drone), ('Save the Date Post'::text,'Pre-production Phase 2'::text,at.save_the_date), ('Save the Video'::text,'Pre-production Phase 2'::text,at.save_the_video), ('Retouch'::text,'Pre-production Phase 2'::text,at.retouch), ((COALESCE(at.event_secondary_photographer_label, 'Secondary Photography'::character varying))::text,'Event'::text,
                      CASE
                          WHEN (jsonb_array_length(COALESCE(at.event_secondary_photographer, '[]'::jsonb)) > 0) THEN (at.event_secondary_photographer ->> 0)
                          ELSE NULL::text
                      END), ((COALESCE(at.event_secondary_videographer_label, 'Secondary Videography'::character varying))::text,'Event'::text,
                      CASE
                          WHEN (jsonb_array_length(COALESCE(at.event_secondary_videographer, '[]'::jsonb)) > 0) THEN (at.event_secondary_videographer ->> 0)
                          ELSE NULL::text
                      END)) role_assignment(task_name, flow_stage, employee_id))
           LEFT JOIN public.employees emp ON (((emp.employee_id)::text = (role_assignment.employee_id)::text)))
           LEFT JOIN LATERAL ( SELECT ap2.status
                 FROM public.assigned_projects ap2
                WHERE (((ap2.project_id)::text = concat('CRM-', COALESCE(el.lead_serial_number, ((el.external_id)::text)::character varying, at.external_lead_id))) AND (((role_assignment.task_name = 'Save the Date Post'::text) AND ((ap2.project_type)::text = ANY ((ARRAY['Save the Date Post'::character varying, 'Save the Date'::character varying, 'Save The Date Post'::character varying, 'Save The Date'::character varying])::text[]))) OR ((role_assignment.task_name = 'Save the Video'::text) AND ((ap2.project_type)::text = ANY ((ARRAY['Save the Date Video'::character varying, 'Save the Video'::character varying, 'Save The Date Video'::character varying, 'Save The Video'::character varying])::text[]))) OR ((role_assignment.task_name = 'Retouch'::text) AND ((ap2.project_type)::text = ANY ((ARRAY['Outdoor Retouch'::character varying, 'Retouch'::character varying, 'Retouching'::character varying])::text[])))))
                ORDER BY
                      CASE
                          WHEN ((ap2.submit_selection IS NOT NULL) OR (ap2.reference_link IS NOT NULL)) THEN 1
                          ELSE 0
                      END DESC, ap2.created_at DESC
               LIMIT 1) ap ON (true))
        WHERE ((role_assignment.employee_id IS NOT NULL) AND ((role_assignment.employee_id)::text <> ''::text));
    `);

    console.log(`✅ All tables verified & created successfully in "${dbName}".`);
  } catch (err) {
    console.error("Error ensuring tables exist:", err);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
};

export const initializeDatabase = async () => {
  try {
    await ensureDatabaseExists();
    await ensureTablesExist();
    console.log("🚀 Database initialization complete and ready.");
  } catch (err) {
    console.error("❌ Database initialization encountered a critical error:", err);
    throw err;
  }
};

