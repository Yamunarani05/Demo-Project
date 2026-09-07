const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:123456@localhost:5432/redangle_preproduction' });
pool.query("UPDATE client_deliveries SET status='client_approved' WHERE lead_id='2' AND status='pending'").then(res => {
    console.log('Updated rows:', res.rowCount);
    pool.end();
}).catch(e => console.error(e));
