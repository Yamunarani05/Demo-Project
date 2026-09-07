const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
client.connect()
  .then(() => client.query("SELECT * FROM event_details WHERE external_lead_id='LD-01'"))
  .then(res => {
    const row = res.rows[0];
    const presentKeys = Object.keys(row).filter(k => row[k] !== null && row[k] !== '' && row[k] !== '[]' && row[k] !== '{}');
    console.log("PRESENT KEYS:", presentKeys);
    
    // Check specific columns for videography
    console.log("save_the_video_upload_notes:", row.save_the_video_upload_notes);
    console.log("video_upload_notes:", row.video_upload_notes);
    console.log("event_video_upload_notes:", row.event_video_upload_notes);
    
    return client.query("SELECT * FROM event_media_clips WHERE external_lead_id='LD-01'");
  })
  .then(res => {
    const row = res.rows[0];
    if (row) {
        const presentKeys = Object.keys(row).filter(k => row[k] !== null && row[k] !== '');
        console.log("CLIPS PRESENT KEYS:", presentKeys);
    }
    client.end();
  })
  .catch(console.error);
