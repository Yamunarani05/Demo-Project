const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'Redangle-Preproduction', password: 'password', port: 6000 });
pool.query("UPDATE external_leads SET current_phase = 'event', phase_status = 'not_started', pre_production_step = 'completed', status = 'Event Coordinator' WHERE lead_serial_number = 'RAS-02' OR external_id::text = 'RAS-02'")
  .then(r => console.log('Updated rows:', r.rowCount))
  .catch(console.error)
  .finally(() => pool.end());
