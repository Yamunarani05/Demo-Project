const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
client.connect()
  .then(() => client.query(`SELECT upload_notes, video_upload_notes, drive_link, video_drive_link FROM event_details WHERE external_lead_id='LD-01'`))
  .then(res => { console.log("UPLOAD:", res.rows[0].upload_notes); console.log("VIDEO:", res.rows[0].video_upload_notes); client.end(); })
  .catch(console.error);
