const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
client.connect()
  .then(() => client.query(`SELECT video_first_clip, video_last_clip FROM event_media_clips WHERE external_lead_id='LD-01'`))
  .then(res => { console.log("VIDEO FIRST:", res.rows[0].video_first_clip?.slice(0, 100)); client.end(); })
  .catch(console.error);
