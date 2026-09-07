const { Pool } = require('pg');
const fs = require('fs');

const poolPreProd = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Redangle-Preproduction',
  password: 'password',
  port: 6000,
});

const poolSales = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Redangle-sales',
  password: 'password',
  port: 6000,
});

async function run() {
  const res = await poolSales.query("SELECT id, serial_number, drive_link, upload_notes, video_drive_link, video_upload_notes FROM leads WHERE serial_number = 'RAS-01'");
  fs.writeFileSync('leads.json', JSON.stringify(res.rows, null, 2));

  const res2 = await poolPreProd.query("SELECT * FROM event_media_clips WHERE external_lead_id = 'RAS-01'");
  fs.writeFileSync('clips.json', JSON.stringify(res2.rows, null, 2));

  process.exit();
}
run();
