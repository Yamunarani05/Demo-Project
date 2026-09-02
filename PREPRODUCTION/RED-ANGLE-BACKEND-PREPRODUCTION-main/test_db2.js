const { Client } = require('pg'); 
const client = new Client({ user: 'postgres', host: 'localhost', database: 'Redangle-Preproduction', password: 'password', port: 6000 }); 
client.connect().then(() => client.query("SELECT accepted_assignments, accepted_by_employees FROM assign_teams WHERE external_lead_id = 'RAS-01'"))
.then(res => { console.log(res.rows[0]); client.end() })
.catch(console.error);
