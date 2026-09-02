import { pool } from "./src/config/db";

const testQuery = async () => {
    try {
        const res = await pool.query("SELECT * FROM external_leads WHERE lead_serial_number = 'CRM-LD-03'");
        console.log("external_leads CRM-LD-03:", res.rows.length);
    } catch (error) {
        console.error("error:", error);
    }
    process.exit(0);
};

testQuery();
