const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
client.connect()
  .then(() => client.query("UPDATE event_details SET video_upload_notes=$1, num_videos=10 WHERE external_lead_id='LD-01'", [JSON.stringify({"service":"Videography","shootDate":"2026-07-10","shootName":"shoot","clientName":"DEMO 1","location":"location","included_file_format":"MP4"})]))
  .then(res => { console.log('Restored video notes'); client.end(); })
  .catch(console.error);
