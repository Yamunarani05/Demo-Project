const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:password@localhost:6000/Redangle-sales' });
pool.query('SELECT * FROM "ClientDelivery" WHERE "leadId" = 1').then(res => { console.log(JSON.stringify(res.rows, null, 2)); process.exit(0); });
