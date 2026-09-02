import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { api } from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('masteradmin@gmail.com')
  const [password, setPassword] = useState('12345678')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const submit = async event => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.login({ email, password })
      localStorage.setItem('master_admin_token', data.token)
      localStorage.setItem('master_admin_user', JSON.stringify(data.user))
      navigate('/sales/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-pattern" />
      <div className="login-grid">
        <section className="login-hero">
          <h1>Red Angle Studio</h1>
          <p>Manage your workspace and collaborate with your team seamlessly with our intuitive platform.</p>
          <div className="login-art-wrap">
            <div className="login-art-glow" />
            <img src="/login_illustration.png" alt="Photographer Character" className="login-art" />
          </div>
        </section>

        <section className="login-card-wrap">
          <form className="login-card" onSubmit={submit}>
            <div className="login-logo">
              <img src="/red_angle_logo.png" alt="RED ANGLE STUDIO" />
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
              <label>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={event => {
                  setEmail(event.target.value)
                  setError('')
                }}
                placeholder="name@example.com"
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <div className="password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={event => {
                    setPassword(event.target.value)
                    setError('')
                  }}
                  placeholder="••••••••"
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(value => !value)} title={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="login-actions">
              <span />
              <button type="button" className="forgot-link">Forgot password?</button>
            </div>

            <button className="login-submit" disabled={loading}>
              {loading ? 'Authenticating...' : 'Continue'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
