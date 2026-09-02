import { pool } from "./src/config/db";
import * as fs from "fs";

async function main() {
    const res = await pool.query(`SELECT * FROM event_details WHERE external_lead_id = 'RAS-01'`);
    fs.writeFileSync("test-output-full.json", JSON.stringify(res.rows, null, 2), "utf8");
    process.exit(0);
}
main();
