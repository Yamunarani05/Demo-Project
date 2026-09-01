import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:password@localhost:6000/Redangle-Preproduction"
  });
  await client.connect();
  try {
      const edRows = await client.query(`
                   SELECT photo_first_clip, video_first_clip, drone_first_clip, secondary_photo_first_clip, secondary_video_first_clip, media_status, drive_link, video_drive_link, save_the_date_drive_link, save_the_video_drive_link, retouch_drive_link
                   FROM event_details 
                   WHERE external_lead_id = $1 OR external_lead_id = $2
                   LIMIT 1
                 `, ['LD-02', '2']);
      console.log("Success event_details:", edRows.rows);
  } catch (e: any) {
      console.log("Error event_details:", e.message);
  }

  try {
      const ppsRows = await client.query(`
                   SELECT photo_first_clip, video_first_clip, media_status, drive_link, video_drive_link
                   FROM pre_production_shoots 
                   WHERE external_lead_id = $1 OR external_lead_id = $2
                   LIMIT 1
                 `, ['LD-02', '2']);
      console.log("Success pre_production_shoots:", ppsRows.rows);
  } catch (e: any) {
      console.log("Error pre_production_shoots:", e.message);
  }

  await client.end();
}
run();
