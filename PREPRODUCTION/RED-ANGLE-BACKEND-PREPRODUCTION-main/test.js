const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:password@localhost:6000/Redangle-Preproduction' });
pool.query('SELECT accepted_assignments FROM assign_teams WHERE external_lead_id = $1 OR external_lead_id = $2', ['LD-01', '1'])
  .then(res => { console.log(JSON.stringify(res.rows, null, 2)); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
