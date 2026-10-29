import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEnvelope, FaKey, FaLock, FaArrowLeft } from 'react-icons/fa'
import Seo from '../components/Seo'
import {
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
} from '../services/authService'

const STEPS = ['email', 'code', 'password']

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const stepIndex = STEPS.indexOf(step)

  const sendCode = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)
    try {
      const data = await requestPasswordReset(email.trim())
      setInfo(data.message || 'If that email is registered, a code has been sent.')
      setStep('code')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const checkCode = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)
    try {
      await verifyResetCode({ email: email.trim(), code: code.trim() })
      setInfo('Code verified. Choose a new password.')
      setStep('password')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      const data = await resetPassword({
        email: email.trim(),
        code: code.trim(),
        password,
      })
      setInfo(data.message || 'Password updated.')
      setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const resend = async () => {
    setError('')
    setInfo('')
    setSubmitting(true)
    try {
      const data = await requestPasswordReset(email.trim())
      setInfo(data.message || 'A new code has been sent if the account exists.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <Seo title="Forgot password" path="/forgot-password" noindex />
      <div className="auth-card">
        <div className="auth-head">
          <h1>Reset your password</h1>
          <p>
            {step === 'email' && 'Enter the email on your gaadi.pk account. We will send a 6-digit code.'}
            {step === 'code' && `Enter the 6-digit code sent to ${email}.`}
            {step === 'password' && 'Choose a new password for your account.'}
          </p>
        </div>

        <div className="reset-steps" aria-hidden="true">
          {STEPS.map((s, i) => (
            <span key={s} className={`reset-step ${i <= stepIndex ? 'active' : ''}`} />
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {info && <div className="alert alert-success">{info}</div>}

        {step === 'email' && (
          <form onSubmit={sendCode} className="form">
            <div className="field">
              <label>Email</label>
              <div className="input-icon">
                <FaEnvelope />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send reset code'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={checkCode} className="form">
            <div className="field">
              <label>6-digit code</label>
              <div className="input-icon">
                <FaKey />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  placeholder="••••••"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  autoFocus
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting || code.length !== 6}>
              {submitting ? 'Checking…' : 'Verify code'}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-block"
              style={{ marginTop: 10 }}
              onClick={resend}
              disabled={submitting}
            >
              Resend code
            </button>
            <button
              type="button"
              className="btn-link reset-back"
              onClick={() => {
                setStep('email')
                setCode('')
                setError('')
                setInfo('')
              }}
            >
              <FaArrowLeft /> Change email
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={savePassword} className="form">
            <div className="field">
              <label>New password</label>
              <div className="input-icon">
                <FaLock />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                />
              </div>
            </div>
            <div className="field">
              <label>Confirm password</label>
              <div className="input-icon">
                <FaLock />
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Saving…' : 'Update password'}
            </button>
          </form>
        )}

        <p className="auth-foot">
          Remembered it? <Link to="/login">Back to log in</Link>
        </p>
      </div>
    </div>
  )
}
