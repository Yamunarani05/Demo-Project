const { Client } = require('pg');

async function copyDeliveries() {
  const preprod = new Client({connectionString: 'postgres://postgres:password@localhost:6000/Redangle-Preproduction'});
  const sales = new Client({connectionString: 'postgres://postgres:password@localhost:6000/Redangle-sales'});
  
  await preprod.connect();
  await sales.connect();
  
  const res = await preprod.query("SELECT * FROM client_deliveries");
  
  for (const row of res.rows) {
    const exists = await sales.query("SELECT id FROM client_deliveries WHERE lead_id = $1 AND delivery_type = $2", [row.lead_id, row.delivery_type]);
    if (exists.rows.length === 0) {
      await sales.query(`
        INSERT INTO client_deliveries (lead_id, delivery_type, drive_link, video_drive_link, drone_photo_drive_link, drone_video_drive_link, status, notes, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [row.lead_id, row.delivery_type, row.drive_link, row.video_drive_link, row.drone_photo_drive_link, row.drone_video_drive_link, row.status, row.notes, row.created_at]);
      console.log('Copied for sales lead:', row.lead_id, 'Type:', row.delivery_type);
    }
  }
  
  await preprod.end();
  await sales.end();
}

copyDeliveries().catch(console.error);
