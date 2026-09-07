const { Pool } = require('pg'); 
const pool = new Pool({ connectionString: 'postgresql://postgres:password@localhost:6000/Redangle-sales' }); 
pool.query('SELECT l.lead_serial_number FROM client_complaints c JOIN leads_detail l ON c.lead_id = l.lead_id')
.then(r => { console.log("success"); pool.end(); })
.catch(e => { console.error("DB ERROR:", e.message); pool.end(); });
