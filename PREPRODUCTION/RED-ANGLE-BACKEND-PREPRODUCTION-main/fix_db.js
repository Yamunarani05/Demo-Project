const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
client.connect()
  .then(() => client.query(`UPDATE approved_drive_links SET sent_to_client = TRUE WHERE project_type = 'Save the Date'`))
  .then(res => { console.log('Updated', res.rowCount); client.end(); })
  .catch(console.error);
