const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
client.connect()
  .then(() => client.query("SELECT * FROM event_details WHERE external_lead_id='LD-01'"))
  .then(res => {
    console.log('save_the_video_drive_link:', res.rows[0].save_the_video_drive_link);
    console.log('save_the_video_upload_notes:', res.rows[0].save_the_video_upload_notes);
    console.log('save_the_date_drive_link:', res.rows[0].save_the_date_drive_link);
    console.log('save_the_date_upload_notes:', res.rows[0].save_the_date_upload_notes);
    client.end();
  })
  .catch(console.error);
