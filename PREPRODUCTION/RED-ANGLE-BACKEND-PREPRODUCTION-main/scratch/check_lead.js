const { Pool } = require('pg'); 
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'redangle', password: 'root', port: 5432 }); 
pool.query("SELECT * FROM external_leads WHERE external_id::text = 'RAS-02' OR lead_serial_number = 'RAS-02'")
.then(r => console.log('EXTERNAL LEADS:', r.rows))
.catch(console.error); 
pool.query("SELECT id, flow_stage, status, is_assigned, event_status FROM event_details WHERE external_lead_id = 'RAS-02'")
.then(r => console.log('EVENT DETAILS:', r.rows))
.catch(console.error)
.finally(() => pool.end());
