import { pool } from "./src/config/db";
import { getIncomingDataQuery } from "./src/queries/dataManager.query";

async function main() {
    const rows = await getIncomingDataQuery('event');
    const ras01 = rows.find((r: any) => r.lead_serial_number === 'RAS-01');
    
    if (ras01) {
        const fields = [
            'lead_serial_number',
            'secondary_photo_approved',
            'secondary_video_approved', 
            'secondary_photographer',
            'secondary_videographer',
            'secondary_photographer_name',
            'secondary_videographer_name',
        ];
        const summary: any = {};
        for (const f of fields) {
            summary[f] = ras01[f];
        }
        // Add status for drive links and notes
        summary.has_secondary_photo_drive = !!ras01.secondary_photo_drive_link;
        summary.has_secondary_photo_notes = !!ras01.secondary_photo_upload_notes;
        console.log(JSON.stringify(summary, null, 2));
    } else {
        console.log("RAS-01 not found. Total rows:", rows.length);
    }
    process.exit(0);
}
main();
