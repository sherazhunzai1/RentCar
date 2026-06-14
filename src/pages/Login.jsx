import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await login(form)
      // Return to the page they were headed to, or a sensible home per role.
      const dest = from || (user.role === 'driver' ? '/driver/dashboard' : '/vehicles')
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const fillDemo = (email) => setForm({ email, password: 'password' })

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <h1>Welcome back</h1>
          <p>Log in to book seats or manage your vehicles.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="field">
            <label>Email</label>
            <div className="input-icon">
              <FaEnvelope />
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Password</label>
            <div className="input-icon">
              <FaLock />
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Logging in…' : (<><FaSignInAlt /> Log In</>)}
          </button>
        </form>

        <div className="demo-box">
          <p>Try a demo driver account:</p>
          <div className="demo-actions">
            <button type="button" className="chip" onClick={() => fillDemo('ahmed@driver.com')}>
              ahmed@driver.com
            </button>
            <button type="button" className="chip" onClick={() => fillDemo('sara@driver.com')}>
              sara@driver.com
            </button>
          </div>
          <small>Password for both: <code>password</code></small>
        </div>

        <p className="auth-foot">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
