const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 6000,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'Redangle-Preproduction'
});

async function dump() {
  const query = `
    SELECT table_name, column_name, data_type, character_maximum_length, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `;
  try {
    const res = await pool.query(query);
    const schema = {};
    for (const row of res.rows) {
      if (!schema[row.table_name]) schema[row.table_name] = [];
      schema[row.table_name].push({
        column: row.column_name,
        type: row.data_type,
        maxLen: row.character_maximum_length,
        default: row.column_default,
        nullable: row.is_nullable
      });
    }
    console.log(JSON.stringify(schema, null, 2));
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  } finally {
    pool.end();
  }
}

dump();
