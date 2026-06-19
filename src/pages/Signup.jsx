import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaLock, FaPhone, FaIdCard, FaCar, FaUserCheck } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { USER_ROLES } from '../data/constants'
import Seo from '../components/Seo'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState(USER_ROLES.PASSENGER)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    phone: '',
    licenseNumber: '',
    experience: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const user = await signup({ ...form, role })
      navigate(user.role === 'driver' ? '/driver/dashboard' : '/vehicles', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const isDriver = role === USER_ROLES.DRIVER

  return (
    <div className="auth-page">
      <Seo
        title="Sign Up — Book Seats or Post Your Vehicle"
        description="Create your gaadi.pk account to book seats to Gilgit-Baltistan, or post your vehicle on routes to Hunza, Gilgit, Skardu and Ghizer."
        path="/signup"
      />
      <div className="auth-card auth-card-wide">
        <div className="auth-head">
          <h1>Create your account</h1>
          <p>Join gaadi.pk to start booking or posting vehicles.</p>
        </div>

        {/* Role selector */}
        <div className="role-toggle">
          <button
            type="button"
            className={`role-option ${!isDriver ? 'active' : ''}`}
            onClick={() => setRole(USER_ROLES.PASSENGER)}
          >
            <FaUserCheck />
            <span>I&apos;m a Passenger</span>
            <small>Browse & book seats</small>
          </button>
          <button
            type="button"
            className={`role-option ${isDriver ? 'active' : ''}`}
            onClick={() => setRole(USER_ROLES.DRIVER)}
          >
            <FaCar />
            <span>I&apos;m a Driver</span>
            <small>Post vehicles & routes</small>
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="field">
            <label>Full name</label>
            <div className="input-icon">
              <FaUser />
              <input type="text" placeholder="John Doe" value={form.name} onChange={set('name')} required />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Email</label>
              <div className="input-icon">
                <FaEnvelope />
                <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              </div>
            </div>
            <div className="field">
              <label>Phone</label>
              <div className="input-icon">
                <FaPhone />
                <input type="tel" placeholder="+92 300 0000000" value={form.phone} onChange={set('phone')} required />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Password</label>
              <div className="input-icon">
                <FaLock />
                <input type="password" placeholder="At least 6 characters" value={form.password} onChange={set('password')} required />
              </div>
            </div>
            <div className="field">
              <label>Confirm password</label>
              <div className="input-icon">
                <FaLock />
                <input type="password" placeholder="Re-enter password" value={form.confirm} onChange={set('confirm')} required />
              </div>
            </div>
          </div>

          {isDriver && (
            <div className="form-row driver-fields">
              <div className="field">
                <label>License number</label>
                <div className="input-icon">
                  <FaIdCard />
                  <input type="text" placeholder="e.g. LHR-2021-88421" value={form.licenseNumber} onChange={set('licenseNumber')} required />
                </div>
              </div>
              <div className="field">
                <label>Years of experience</label>
                <input type="number" min="0" max="60" placeholder="e.g. 5" value={form.experience} onChange={set('experience')} required />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-foot">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}
