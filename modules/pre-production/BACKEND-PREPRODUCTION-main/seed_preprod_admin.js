require('dotenv').config();
const { pool } = require('./dist/src/config/db');
const bcrypt = require('bcryptjs');

async function seedPreprodAdmin() {
  try {
    const hash = await bcrypt.hash('12345678', 10);
    const email = 'preprodadmin@gmail.com';
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, roles, is_active, created_at)
       VALUES ($1, $2, $3, $4, ARRAY[$4::varchar], true, NOW())
       ON CONFLICT (email)
       DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role,
         roles = EXCLUDED.roles,
         is_active = true
       RETURNING id, name, email, role, roles, is_active`,
      ['Preprod Admin', email, hash, 'admin']
    );
    console.log("Preprod Admin seeded:", JSON.stringify(result.rows[0], null, 2));
  } catch (error) {
    console.error("Error seeding preprod admin:", error);
  } finally {
    await pool.end();
  }
}

seedPreprodAdmin();
