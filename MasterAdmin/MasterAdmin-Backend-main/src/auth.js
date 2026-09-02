const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('./db')

const JWT_SECRET = process.env.JWT_SECRET || 'redangle_master_admin_secret_2026'
const JWT_EXPIRES_IN = '8h'

const normalizeRole = role =>
  String(role || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-') === 'masteradmin'
    ? 'master-admin'
    : String(role || '')
        .trim()
        .toLowerCase()
        .replace(/_/g, '-')
        .replace(/\s+/g, '-')

const normalizeRoles = (roles, fallbackRole) => {
  const raw = Array.isArray(roles) && roles.length ? roles : [fallbackRole]
  return Array.from(new Set(raw.map(normalizeRole).filter(Boolean)))
}

const login = async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' })
  }

  const result = await pool.query(
    `SELECT id, name, email, password_hash, role, roles, is_active
     FROM users
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
    [email.trim()]
  )

  const user = result.rows[0]
  if (!user || !user.is_active) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' })
  }

  const userRoles = normalizeRoles(user.roles, user.role)
  if (!userRoles.includes('master-admin')) {
    return res.status(403).json({ success: false, message: 'This account is not a Master Admin account' })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' })
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: 'master-admin', roles: ['master-admin'] },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )

  return res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'master-admin',
        roles: ['master-admin'],
        redirectPath: '/sales/dashboard',
      },
    },
  })
}

const requireMasterAdmin = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' })

    const decoded = jwt.verify(token, JWT_SECRET)
    const roles = normalizeRoles(decoded.roles, decoded.role)
    if (!roles.includes('master-admin')) {
      return res.status(403).json({ success: false, message: 'Master Admin access required' })
    }

    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

const verify = async (req, res) => {
  return res.json({
    success: true,
    data: {
      id: req.user.userId,
      email: req.user.email,
      role: 'master-admin',
      roles: ['master-admin'],
      redirectPath: '/sales/dashboard',
    },
  })
}

module.exports = { login, requireMasterAdmin, verify, normalizeRole }
