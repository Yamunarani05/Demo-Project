const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
client.connect()
  .then(() => client.query(`UPDATE event_details SET video_upload_notes = NULL, video_camera_used = NULL, num_videos = 0, video_drive_link = NULL WHERE external_lead_id='LD-01'`))
  .then(res => { console.log('Wiped video details', res.rowCount); client.end(); })
  .catch(console.error);
