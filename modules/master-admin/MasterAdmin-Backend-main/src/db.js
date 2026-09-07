const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  host: process.env.DB_PREPRODUCTION_HOST,
  port: Number(process.env.DB_PREPRODUCTION_PORT),
  user: process.env.DB_PREPRODUCTION_USER,
  password: process.env.DB_PREPRODUCTION_PASSWORD,
  database: process.env.DB_PREPRODUCTION_NAME,
})

const salesPool = new Pool({
  host: process.env.DB_SALES_HOST,
  port: Number(process.env.DB_SALES_PORT),
  user: process.env.DB_SALES_USER,
  password: process.env.DB_SALES_PASSWORD,
  database: process.env.DB_SALES_NAME,
})

module.exports = { pool, salesPool }
