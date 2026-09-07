require('dotenv').config()
const bcrypt = require('bcryptjs')
const { pool } = require('../src/db')

const run = async () => {
  const email = 'masteradmin@gmail.com'
  const passwordHash = await bcrypt.hash('12345678', 10)
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
    ['Master Admin', email, passwordHash, 'master-admin']
  )
  console.log(JSON.stringify(result.rows[0], null, 2))
  await pool.end()
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
