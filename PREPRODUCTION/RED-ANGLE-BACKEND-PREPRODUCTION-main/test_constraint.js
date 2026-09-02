const { Client } = require('pg');
const c = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
c.connect()
  .then(() => c.query(`SELECT pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE c.conname = 'assigned_projects_unique_assignment'`))
  .then(res => console.log(res.rows))
  .catch(console.error)
  .finally(() => c.end());
