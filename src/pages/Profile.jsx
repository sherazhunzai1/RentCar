import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUserCircle, FaCar, FaUserCheck, FaSignOutAlt, FaCamera, FaTrash } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useConfirm } from '../context/ConfirmContext'
import { GENDERS, VEHICLE_TYPES } from '../data/constants'
import { formatDate } from '../utils/format'
import { mediaUrl } from '../utils/media'
import Seo from '../components/Seo'

export default function Profile() {
  const { user, updateProfile, uploadAvatar, deleteAvatar, isDriver, logout } = useAuth()
  const confirm = useConfirm()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || '',
    gender: user.gender || '',
    licenseNumber: user.licenseNumber || '',
    experience: user.experience || '',
    vehicleType: user.vehicleType || 'car',
    vehicleName: user.vehicleName || '',
    vehicleNumber: user.vehicleNumber || '',
  })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [avatarNotice, setAvatarNotice] = useState('')

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value })
    setSaved(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      if (isDriver) {
        if (!form.vehicleName.trim() || !form.vehicleNumber.trim()) {
          setError('Vehicle name/model and registration number are required.')
          setSaving(false)
          return
        }
        await updateProfile({
          name: form.name,
          phone: form.phone,
          licenseNumber: form.licenseNumber,
          experience: Number(form.experience),
          vehicleType: form.vehicleType,
          vehicleName: form.vehicleName.trim(),
          vehicleNumber: form.vehicleNumber.trim(),
        })
      } else {
        await updateProfile({ name: form.name, phone: form.phone, gender: form.gender })
      }
      setSaved(true)
    } catch (err) {
      setError(err.message || 'Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarPick = () => fileRef.current?.click()

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file (JPG, PNG or WebP).')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image is too large. Max size is 2 MB.')
      return
    }
    setAvatarError('')
    setAvatarNotice('')
    setAvatarBusy(true)
    try {
      await uploadAvatar(file)
      setAvatarNotice('Profile picture updated.')
    } catch (err) {
      setAvatarError(err.message || 'Could not upload picture.')
    } finally {
      setAvatarBusy(false)
    }
  }

  const handleAvatarRemove = async () => {
    if (!user.avatarUrl) return
    const ok = await confirm({
      title: 'Remove photo?',
      message: 'Your profile picture will be removed from your account.',
      confirmLabel: 'Remove',
      danger: true,
    })
    if (!ok) return
    setAvatarError('')
    setAvatarNotice('')
    setAvatarBusy(true)
    try {
      await deleteAvatar()
      setAvatarNotice('Profile picture removed.')
    } catch (err) {
      setAvatarError(err.message || 'Could not remove picture.')
    } finally {
      setAvatarBusy(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const avatarSrc = mediaUrl(user.avatarUrl)

  return (
    <div className="container narrow section">
      <Seo title="My Profile" path="/profile" noindex />
      <div className="page-title-block">
        <h1>My Profile</h1>
        <p>Manage your account details and profile picture.</p>
      </div>

      <div className="profile-card card">
        <div className="profile-banner">
          <div className="profile-avatar-wrap">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="profile-avatar-img" />
            ) : (
              <FaUserCircle className="profile-avatar" />
            )}
            <button
              type="button"
              className="profile-avatar-btn"
              onClick={handleAvatarPick}
              disabled={avatarBusy}
              aria-label="Upload profile picture"
              title="Upload profile picture"
            >
              <FaCamera />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <h2>{user.name}</h2>
            <span className={`role-badge ${isDriver ? 'driver' : 'passenger'}`}>
              {isDriver ? <FaCar /> : <FaUserCheck />}
              {isDriver ? 'Driver' : 'Passenger'}
            </span>
            <p className="joined">Member since {formatDate(user.createdAt?.split('T')[0])}</p>
            <div className="profile-avatar-actions">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleAvatarPick}
                disabled={avatarBusy}
              >
                <FaCamera /> {avatarBusy ? 'Uploading…' : avatarSrc ? 'Change photo' : 'Upload photo'}
              </button>
              {avatarSrc && (
                <button
                  type="button"
                  className="btn btn-danger-ghost btn-sm"
                  onClick={handleAvatarRemove}
                  disabled={avatarBusy}
                >
                  <FaTrash /> Remove
                </button>
              )}
            </div>
            <p className="muted-note profile-avatar-hint">JPG, PNG or WebP · max 2 MB</p>
          </div>
        </div>

        {avatarError && <div className="alert alert-error">{avatarError}</div>}
        {avatarNotice && <div className="alert alert-success">{avatarNotice}</div>}
        {error && <div className="alert alert-error">{error}</div>}
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
            <>
              <div className="field">
                <label>Years of experience</label>
                <input type="number" min="0" value={form.experience} onChange={set('experience')} />
              </div>

              <h3 className="card-section-title" style={{ marginTop: 8 }}>Your vehicle</h3>
              <p className="muted-note" style={{ marginTop: -4 }}>
                Used when you offer on passenger ride requests — not related to posted trip listings.
              </p>
              <div className="field">
                <label>Vehicle type</label>
                <div className="type-picker">
                  {VEHICLE_TYPES.map((t) => {
                    const Icon = t.icon
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`type-pick ${form.vehicleType === t.id ? 'active' : ''}`}
                        onClick={() => {
                          setForm({ ...form, vehicleType: t.id })
                          setSaved(false)
                        }}
                      >
                        <Icon />
                        <span>{t.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Vehicle name / model</label>
                  <input
                    type="text"
                    placeholder="e.g. Toyota Hiace Grand Cabin"
                    value={form.vehicleName}
                    onChange={set('vehicleName')}
                    required
                  />
                </div>
                <div className="field">
                  <label>Registration number</label>
                  <input
                    type="text"
                    placeholder="e.g. LES-7781"
                    value={form.vehicleNumber}
                    onChange={set('vehicleNumber')}
                    required
                  />
                </div>
              </div>
            </>
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
