import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUserCircle, FaCar, FaUserCheck, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { GENDERS } from '../data/constants'
import { formatDate } from '../utils/format'
import Seo from '../components/Seo'

export default function Profile() {
  const { user, updateProfile, isDriver, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || '',
    gender: user.gender || '',
    licenseNumber: user.licenseNumber || '',
    experience: user.experience || '',
  })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value })
    setSaved(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(
        isDriver
          ? { name: form.name, phone: form.phone, licenseNumber: form.licenseNumber, experience: Number(form.experience) }
          : { name: form.name, phone: form.phone, gender: form.gender },
      )
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="container narrow section">
      <Seo title="My Profile" path="/profile" noindex />
      <div className="page-title-block">
        <h1>My Profile</h1>
        <p>Manage your account details.</p>
      </div>

      <div className="profile-card card">
        <div className="profile-banner">
          <FaUserCircle className="profile-avatar" />
          <div>
            <h2>{user.name}</h2>
            <span className={`role-badge ${isDriver ? 'driver' : 'passenger'}`}>
              {isDriver ? <FaCar /> : <FaUserCheck />}
              {isDriver ? 'Driver' : 'Passenger'}
            </span>
            <p className="joined">Member since {formatDate(user.createdAt?.split('T')[0])}</p>
          </div>
        </div>

        {saved && <div className="alert alert-success">Profile updated successfully.</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <div className="field">
              <label>Full name</label>
              <input type="text" value={form.name} onChange={set('name')} required />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={user.email} disabled />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Phone</label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+92 300 0000000" />
            </div>
            {isDriver ? (
              <div className="field">
                <label>License number</label>
                <input type="text" value={form.licenseNumber} onChange={set('licenseNumber')} />
              </div>
            ) : (
              <div className="field">
                <label>Gender</label>
                <div className="gender-toggle">
                  {GENDERS.map((g) => (
                    <button
                      type="button"
                      key={g.id}
                      className={`gender-option ${form.gender === g.id ? 'active' : ''}`}
                      onClick={() => {
                        setForm({ ...form, gender: g.id })
                        setSaved(false)
                      }}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isDriver && (
            <div className="field">
              <label>Years of experience</label>
              <input type="number" min="0" value={form.experience} onChange={set('experience')} />
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <div className="profile-logout">
          <button className="btn btn-danger-ghost btn-block" onClick={handleLogout}>
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      </div>
    </div>
  )
}
