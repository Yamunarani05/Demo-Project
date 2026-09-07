import { pool } from "./src/config/db";

async function addMissingCols() {
  try {
    await pool.query(`
      ALTER TABLE event_details 
      ADD COLUMN IF NOT EXISTS video_upload_notes TEXT,
      ADD COLUMN IF NOT EXISTS upload_notes TEXT,
      ADD COLUMN IF NOT EXISTS camera_used TEXT,
      ADD COLUMN IF NOT EXISTS video_camera_used TEXT,
      ADD COLUMN IF NOT EXISTS num_images INTEGER,
      ADD COLUMN IF NOT EXISTS num_videos INTEGER,
      ADD COLUMN IF NOT EXISTS drive_link TEXT,
      ADD COLUMN IF NOT EXISTS video_drive_link TEXT;
    `);
    
    // Add columns to external_leads just in case they were recently added
    await pool.query(`
      ALTER TABLE external_leads
      ADD COLUMN IF NOT EXISTS flow_type VARCHAR(20),
      ADD COLUMN IF NOT EXISTS current_phase VARCHAR(30) DEFAULT 'not_started',
      ADD COLUMN IF NOT EXISTS phase_status VARCHAR(20) DEFAULT 'not_started',
      ADD COLUMN IF NOT EXISTS phase_owner VARCHAR(30),
      ADD COLUMN IF NOT EXISTS pre_production_step VARCHAR(20) DEFAULT 'shoot';
    `);

    console.log("Cols added successfully!");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    process.exit(0);
  }
}

addMissingCols();
