const { Client } = require('pg'); 
const client = new Client({ user: 'postgres', host: 'localhost', database: 'Redangle-sales', password: 'password', port: 6000 }); 
client.connect().then(() => client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
.then(res => { console.log(res.rows.map(r => r.table_name)); client.end() })
.catch(console.error);
