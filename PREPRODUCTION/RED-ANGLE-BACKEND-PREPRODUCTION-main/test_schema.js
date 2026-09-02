const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
client.connect()
  .then(() => client.query("SELECT column_name FROM information_schema.columns WHERE table_name='event_media_clips'"))
  .then(res => { console.log(res.rows.map(r => r.column_name)); client.end(); })
  .catch(console.error);
