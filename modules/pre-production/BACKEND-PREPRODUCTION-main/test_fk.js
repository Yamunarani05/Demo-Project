const { Client } = require('pg');
const c = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
c.connect()
  .then(() => c.query(`SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name 
  FROM information_schema.table_constraints tc 
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name 
  JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name 
  WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'assigned_projects'`))
  .then(res => console.log(res.rows))
  .catch(console.error)
  .finally(() => c.end());
