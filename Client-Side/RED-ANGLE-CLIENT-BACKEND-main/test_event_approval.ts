import { preprodPool } from "./src/config/db";

const testQuery = async () => {
    try {
        const clientReqData = JSON.stringify({
            traditional: { ref: '', sel: '' },
            candid: { ref: '', sel: '' },
            retouch: { ref: '', sel: '' },
            album: { ref: '', sel: '' },
            submittedAt: new Date().toISOString()
        });

        console.log("Updating event_details...");
        await preprodPool.query(
            `UPDATE event_details SET client_requirements = $1 WHERE external_lead_id = $2`,
            [clientReqData, 'TEST-LEAD-1']
        );
        console.log("Updated event_details.");

        console.log("Updating external_leads...");
        await preprodPool.query(
            `UPDATE external_leads 
             SET current_phase = 'post_production', phase_status = 'not_started', phase_owner = 'post-production-crm' 
             WHERE lead_serial_number = $1`,
            ['TEST-LEAD-1']
        );
        console.log("Updated external_leads.");

    } catch (error) {
        console.error("error:", error);
    }
    process.exit(0);
};

testQuery();
