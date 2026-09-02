const { Pool } = require('pg');
require('dotenv').config();

async function test() {
  const salesPool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.SALES_DB_NAME || "Redangle",
  });
  
  try {
    const res = await salesPool.query(`SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'leads_detail'
    ) AS exists`);
    console.log("leads_detail exists:", res.rows[0].exists);
  } catch (err) {
    console.error("Error:", err);
  }
  await salesPool.end();
}

test();
