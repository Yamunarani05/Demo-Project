const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
client.connect()
  .then(() => client.query(`SELECT photo_first_clip, video_first_clip, photo_last_clip, video_last_clip FROM event_media_clips WHERE external_lead_id='LD-01'`))
  .then(res => { console.log("PHOTO_FIRST:", !!res.rows[0].photo_first_clip, "VIDEO_FIRST:", !!res.rows[0].video_first_clip); client.end(); })
  .catch(console.error);
