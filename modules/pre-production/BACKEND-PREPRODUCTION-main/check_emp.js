const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
client.connect()
  .then(() => client.query(`SELECT id, employee_id FROM employees WHERE email='mukilanbalakrishnan7@gmail.com'`))
  .then(res => { console.log(res.rows); client.end(); })
  .catch(console.error);
