import { pool, salesPool } from "./src/config/db";

const testQuery = async () => {
    try {
        console.log("Testing with pool (Preproduction DB)");
        const res1 = await pool.query("SELECT * FROM client_complaints LIMIT 1;");
        console.log("pool success", res1.rows);
    } catch (error) {
        console.error("pool error:", error);
    }

    try {
        console.log("Testing with salesPool (Sales DB)");
        const res2 = await salesPool.query("SELECT * FROM client_complaints LIMIT 1;");
        console.log("salesPool success", res2.rows);
    } catch (error) {
        console.error("salesPool error:", error);
    }
    
    process.exit(0);
};

testQuery();
