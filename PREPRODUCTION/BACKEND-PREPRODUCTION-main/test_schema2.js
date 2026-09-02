const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
client.connect()
  .then(() => client.query("SELECT column_name FROM information_schema.columns WHERE table_name='event_details' AND column_name LIKE '%event%'"))
  .then(res => { console.log("Event details columns:", res.rows.map(r => r.column_name)); return client.query("SELECT column_name FROM information_schema.columns WHERE table_name='event_media_clips' AND column_name LIKE '%event%'"); })
  .then(res => { console.log("Event media clips columns:", res.rows.map(r => r.column_name)); client.end(); })
  .catch(console.error);
