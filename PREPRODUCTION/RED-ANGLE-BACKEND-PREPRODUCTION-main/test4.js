const { Client } = require('pg');
const client = new Client({connectionString: 'postgres://postgres:password@localhost:6000/Redangle-sales'});
client.connect()
  .then(() => client.query("SELECT lead_id, lead_serial_number, first_name FROM leads_detail WHERE lead_serial_number IN ('LD-04', 'LD-05')"))
  .then(res => { console.log("Sales leads:", JSON.stringify(res.rows, null, 2)); client.end(); })
  .catch(e => console.error(e));
