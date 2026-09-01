import { preprodPool } from "./src/config/db";

const testQuery = async () => {
    try {
        const res = await preprodPool.query("SELECT * FROM client_deliveries WHERE delivery_type = 'FINAL_DELIVERABLES' ORDER BY created_at DESC LIMIT 1");
        console.log(res.rows[0]);
    } catch (error) {
        console.error("error:", error);
    }
    process.exit(0);
};

testQuery();
