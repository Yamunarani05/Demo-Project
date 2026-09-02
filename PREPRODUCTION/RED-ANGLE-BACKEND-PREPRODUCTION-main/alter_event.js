const { pool } = require('./dist/config/db');
async function alter() {
  try {
    await pool.query(`
      ALTER TABLE event_details 
      ADD COLUMN IF NOT EXISTS cr3_mode VARCHAR(50), 
      ADD COLUMN IF NOT EXISTS cr3_other_reason TEXT, 
      ADD COLUMN IF NOT EXISTS first_clip_base64 TEXT, 
      ADD COLUMN IF NOT EXISTS last_clip_base64 TEXT;
    `);
    console.log('Columns added successfully');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
alter();
