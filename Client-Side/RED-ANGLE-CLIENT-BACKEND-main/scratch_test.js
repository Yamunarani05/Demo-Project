const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const preprodPool = new Pool({ connectionString: 'postgresql://postgres:password@localhost:6000/Redangle-Preproduction' });

async function test() {
  const leadId = 3;
  const rawData = await prisma.clientDelivery.findFirst({
    where: { leadId, deliveryType: { in: ['RAW_DATA', 'EVENT_RAW_DATA'] } },
    orderBy: { createdAt: 'desc' }
  });
  console.log('rawData:', rawData);

  const { rows } = await preprodPool.query(`
    SELECT 
      COALESCE(pps.drive_link, ed.drive_link) AS drive_link, 
      COALESCE(pps.video_drive_link, ed.video_drive_link) AS video_drive_link, 
      COALESCE(pps.drive_link, ed.save_the_date_drive_link) AS save_the_date_drive_link, 
      COALESCE(pps.video_drive_link, ed.save_the_video_drive_link) AS save_the_video_drive_link, 
      COALESCE(pps.drive_link, ed.retouch_drive_link) AS retouch_drive_link, 
      el.current_phase 
    FROM external_leads el 
    LEFT JOIN event_details ed ON ed.external_lead_id = el.external_id::text OR ed.external_lead_id = el.lead_serial_number 
    LEFT JOIN pre_production_shoots pps ON pps.external_lead_id = el.external_id::text OR pps.external_lead_id = el.lead_serial_number 
    WHERE el.external_id::text = 'RAS-01' OR el.lead_serial_number = 'RAS-01' 
    ORDER BY COALESCE(pps.updated_at, ed.updated_at) DESC LIMIT 1
  `);
  
  console.log('liveData:', rows[0]);
  const liveData = rows[0] || {};
  let driveLink = rawData?.driveLink || null;
  let videoDriveLink = rawData?.videoDriveLink || null;
  
  const type = 'Save the Date';
  if (type === 'Save the Date') {
    driveLink = liveData.drive_link || liveData.save_the_date_drive_link || null;
    videoDriveLink = liveData.video_drive_link || null;
  }
  
  console.log('final driveLink:', driveLink);
  console.log('final videoDriveLink:', videoDriveLink);
}

test()
  .then(() => process.exit(0))
  .catch(e => console.error(e));
