import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@dormhub.com', password: 'admin123' },
  { label: 'Student', email: 'maria@email.com', password: 'student123' },
  { label: 'Staff', email: 'staff@dormhub.com', password: 'staff123' },
]

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const { signIn, signUp, resetPassword } = useAuth()
  const navigate = useNavigate()

  const switchMode = nextMode => {
    setMode(nextMode)
    setMessage(null)
  }

  const useDemoAccount = account => {
    setMode('login')
    setEmail(account.email)
    setPassword(account.password)
    setMessage(null)
  }

  const handleSubmit = async event => {
    event?.preventDefault()

    const trimmedEmail = email.trim()
    const trimmedName = name.trim()

    if (!trimmedEmail) {
      setMessage({ type: 'error', text: 'Please enter your email address.' })
      return
    }

    if (mode === 'register' && !trimmedName) {
      setMessage({ type: 'error', text: 'Please enter your full name.' })
      return
    }

    if (mode !== 'forgot' && password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      if (mode === 'login') {
        const { error } = await signIn(trimmedEmail, password)
        if (error) setMessage({ type: 'error', text: error.message })
        else navigate('/')
      } 
      else if (mode === 'register') {
        const { error } = await signUp(trimmedEmail, password, trimmedName, role)
        if (error) setMessage({ type: 'error', text: error.message })
        else {
          setPassword('')
          setMode('login')
          setMessage({ type: 'success', text: 'Account created! You can now sign in.' })
        }
      } 
      else {
        const { error } = await resetPassword(trimmedEmail)
        if (error) setMessage({ type: 'error', text: error.message })
        else setMessage({ type: 'success', text: 'Password reset email sent.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            background: 'rgba(110,231,183,0.15)',
            borderRadius: 16,
            marginBottom: 14,
            fontSize: 32
          }}>
            🏠
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32 }}>
            DormHub
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>
            Dormitory Management System
          </p>
        </div>

        {/* Card */}
        <form className="card" onSubmit={handleSubmit}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 18,
            marginBottom: 20
          }}>
            {mode === 'login'
              ? 'Sign In'
              : mode === 'register'
              ? 'Create Account'
              : 'Reset Password'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {mode === 'register' && (
              <div>
                <label className="form-label">Full Name</label>
                <input
                  className="input-field"
                  placeholder="Juan dela Cruz"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="form-label">Role</label>
                <select
                  className="input-field"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="student">Student / Tenant</option>
                  <option value="staff">Staff / Caretaker</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            {mode === 'login' && (
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{ fontSize: 13, color: 'var(--accent)', cursor: 'pointer' }}
                  onClick={() => switchMode('forgot')}
                >
                  Forgot password?
                </span>
              </div>
            )}

            {message && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  background:
                    message.type === 'error'
                      ? 'rgba(248,81,73,0.1)'
                      : 'rgba(110,231,183,0.1)',
                  color:
                    message.type === 'error'
                      ? '#f85149'
                      : 'var(--accent)',
                  border: `1px solid ${
                    message.type === 'error'
                      ? '#f8514933'
                      : 'var(--accent)33'
                  }`
                }}
              >
                {message.text}
              </div>
            )}

            {mode === 'login' && (
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: 12,
                  background: 'var(--surface2)'
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
                  Demo accounts
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {DEMO_ACCOUNTS.map(account => (
                    <button
                      key={account.email}
                      type="button"
                      className="btn-ghost"
                      style={{ justifyContent: 'center', padding: '7px 8px', fontSize: 12 }}
                      onClick={() => useDemoAccount(account)}
                    >
                      {account.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: 15,
                justifyContent: 'center'
              }}
              disabled={loading}
            >
              {loading
                ? 'Please wait…'
                : mode === 'login'
                ? 'Sign In'
                : mode === 'register'
                ? 'Create Account'
                : 'Send Reset Email'}
            </button>
          </div>

          <div
            style={{
              marginTop: 18,
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--muted)'
            }}
          >
            {mode === 'login' ? (
              <>
                <span>Don't have an account? </span>
                <span
                  style={{ color: 'var(--accent)', cursor: 'pointer' }}
                  onClick={() => switchMode('register')}
                >
                  Register
                </span>
              </>
            ) : (
              <>
                <span>Already have an account? </span>
                <span
                  style={{ color: 'var(--accent)', cursor: 'pointer' }}
                  onClick={() => switchMode('login')}
                >
                  Sign in
                </span>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
