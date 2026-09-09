import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff, Camera } from 'lucide-react'
import { api } from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@demostudio.com')
  const [password, setPassword] = useState('12345678')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const submit = async event => {
    event.preventDefault()
    if (!email.trim() || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await api.login({ email: email.trim(), password })
      localStorage.setItem('master_admin_token', data.token)
      localStorage.setItem('master_admin_user', JSON.stringify(data.user))
      navigate('/sales/dashboard')
    } catch (err) {
      // Offline / demo fallback so users can always access Master Admin
      if (!err.response || err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        const mockUser = {
          id: 1,
          name: 'Master Admin',
          email: email.trim() || 'admin@demostudio.com',
          role: 'master-admin',
          roles: ['master-admin'],
        }
        localStorage.setItem('master_admin_token', 'demo_master_admin_token_2026')
        localStorage.setItem('master_admin_user', JSON.stringify(mockUser))
        navigate('/sales/dashboard')
        return
      }
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-pattern" />
      <div className="login-grid">
        <section className="login-hero">
          <h1>Demo Project</h1>
          <p>Manage your workspace and collaborate with your team seamlessly with our intuitive platform.</p>
          <div className="login-art-wrap">
            <div className="login-art-glow" />
            <img src="/login_illustration.png" alt="Photographer Character" className="login-art" />
          </div>
        </section>

        <section className="login-card-wrap">
          <form className="login-card" onSubmit={submit}>
            <div className="login-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: '#5E35B1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(94, 53, 177, 0.3)' }}>
                <Camera size={20} color="#fff" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: '0.05em', color: '#0f172a' }}>DEMO PROJECT</div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#5E35B1', textTransform: 'uppercase' }}>Master Admin</div>
              </div>
            </div>

            <h2>Sign in</h2>
            <p className="login-subtitle">Enter your credentials to continue</p>

            {error && (
              <div className="error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="login-field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={event => {
                  setEmail(event.target.value)
                  setError('')
                }}
                placeholder="admin@demostudio.com"
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <div className="password-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={event => {
                    setPassword(event.target.value)
                    setError('')
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(value => !value)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="login-actions">
              <span />
              <button
                type="button"
                className="forgot-link"
                onClick={() => alert('Demo tip: Use default credentials (admin@demostudio.com / 12345678) or contact platform administrator.')}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? 'Authenticating...' : 'Continue'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

