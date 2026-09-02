require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const { pool, salesPool } = require('./src/db')
const { login, requireMasterAdmin, verify } = require('./src/auth')
const masterAdminRoutes = require('./src/masterAdmin.routes')

const app = express()
const port = Number(process.env.PORT || 5011)
const host = process.env.HOST || '127.0.0.1'

const allowedOrigins = new Set(
  String(process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
)

const isAllowedDevOrigin = origin => /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin) || isAllowedDevOrigin(origin)) {
      callback(null, true)
      return
    }
    callback(new Error(`CORS blocked origin: ${origin}`))
  },
  credentials: true,
}))
app.use(express.json())

const preproductionUploads = process.env.PREPRODUCTION_UPLOADS_DIR || path.resolve(
  __dirname,
  '..',
  '..',
  'pre and post production',
  'RED-ANGLE-BACKEND-PREPRODUCTION',
  'uploads'
)

app.use('/uploads', express.static(preproductionUploads))

app.get('/', (_req, res) => res.send('Red Angle Master Admin Backend Running'))
app.post('/api/auth/login', login)
app.get('/api/auth/verify', requireMasterAdmin, verify)
app.use('/api/master-admin', requireMasterAdmin, masterAdminRoutes)

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' })
})

const server = app.listen(port, host, async () => {
  console.log(`Master Admin backend running on ${host}:${port}`)
  console.log(`API ready at http://${host}:${port}`)
  console.log('Keep this terminal open. Press Ctrl+C to stop the backend.')
  try {
    await pool.query('SELECT 1')
    console.log(`Connected to Preproduction DB: ${process.env.DB_PREPRODUCTION_NAME}`)
  } catch (error) {
    console.error('Preproduction DB connection failed:', error.message)
  }
  try {
    await salesPool.query('SELECT 1')
    console.log(`Connected to Sales DB: ${process.env.DB_SALES_NAME}`)
  } catch (error) {
    console.error('Sales DB connection failed:', error.message)
  }
})

server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the existing Master Admin backend or change PORT in .env.`)
    process.exit(1)
  }

  console.error('Failed to start Master Admin backend:', error)
  process.exit(1)
})

const shutdown = async () => {
  console.log('\nStopping Master Admin backend...')
  server.close(async () => {
    await Promise.allSettled([pool.end(), salesPool.end()])
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
