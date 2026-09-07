import { pool } from "./src/config/db";

async function checkDb() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables in database:", res.rows.map(r => r.table_name));

    // Try selecting from external_leads
    const leads = await pool.query('SELECT COUNT(*) FROM external_leads');
    console.log('external_leads count:', leads.rows[0]);

    // Try selecting from event_details
    const events = await pool.query('SELECT COUNT(*) FROM event_details');
    console.log('event_details count:', events.rows[0]);
    
  } catch (err) {
    console.error("Database query failed:", err.message);
  } finally {
    process.exit(0);
  }
}

checkDb();
