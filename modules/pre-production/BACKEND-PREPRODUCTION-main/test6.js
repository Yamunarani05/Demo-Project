const { Client } = require('pg');

async function copyDeliveries() {
  const preprod = new Client({connectionString: 'postgres://postgres:password@localhost:6000/Redangle-Preproduction'});
  const sales = new Client({connectionString: 'postgres://postgres:password@localhost:6000/Redangle-sales'});
  
  await preprod.connect();
  await sales.connect();
  
  const res = await preprod.query("SELECT * FROM client_deliveries WHERE delivery_type = 'RAW_DATA'");
  
  for (const row of res.rows) {
    // Find the sales lead_id corresponding to this lead_serial_number
    const extLead = await preprod.query("SELECT lead_serial_number FROM external_leads WHERE external_id::text = $1 OR lead_serial_number = $1", [row.lead_id.toString()]);
    const serial = extLead.rows[0]?.lead_serial_number || row.lead_id.toString();
    
    const salesLead = await sales.query("SELECT lead_id FROM leads_detail WHERE lead_serial_number = $1", [serial]);
    if (salesLead.rows[0]) {
      const sId = salesLead.rows[0].lead_id;
      
      const exists = await sales.query("SELECT id FROM client_deliveries WHERE lead_id = $1 AND delivery_type = 'RAW_DATA'", [sId]);
      if (exists.rows.length === 0) {
        await sales.query(`
          INSERT INTO client_deliveries (lead_id, delivery_type, drive_link, video_drive_link, status, notes, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [sId, row.delivery_type, row.drive_link, row.video_drive_link, row.status, row.notes, row.created_at]);
        console.log('Copied for sales lead:', sId);
      }
    }
  }
  
  await preprod.end();
  await sales.end();
}

copyDeliveries().catch(console.error);
