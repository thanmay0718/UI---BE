import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icons'
import './SignUpPage.css'
import api from '../services/api' // ðŸ”¥ IMPORTANT

const STRENGTHS = [
  { label: 'Weak', color: '#ff4136', width: '25%' },
  { label: 'Fair', color: '#ff851b', width: '50%' },
  { label: 'Good', color: '#2ecc40', width: '75%' },
  { label: 'Strong', color: '#00d084', width: '100%' },
]

function getStrength(pw) {
  if (!pw) return -1
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score - 1
}

export default function SignUpPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirm: '',
    phone: '',
    role: 'Worker'
  })

  const [showPw, setShowPw] = useState(false)

  const strength = getStrength(form.password)
  const strengthInfo = strength >= 0 ? STRENGTHS[strength] : null

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  // ðŸ”¥ FINAL FIXED HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault()

    // âœ… Password match validation
    if (form.password !== form.confirm) {
      alert("Passwords do not match")
      return
    }

    try {
      const res = await api.post("/auth/register", {
        name: form.fullName,
        username: form.username,
        email: form.email,
        password: form.password,
        phoneNumber: form.phone,
        role: form.role.toUpperCase() // WORKER / ADMIN
      })

      console.log("Signup Success:", res.data)

      alert("Account created successfully!")

      // âœ… Redirect to login
      navigate("/login")

    } catch (err) {
      console.error("Signup Error:", err)
      alert(err.response?.data || "Signup failed")
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-bg-glow" />

      {/* Left panel */}
      <div className="signup-left">
        <Link to="/" className="signup-brand">
          <div className="logo-shield">
            <Icon name="shield" size={16} color="var(--on-primary-fixed)" strokeWidth={2.5} />
          </div>
          <span className="logo-text">
            GigShield <span className="logo-ai">AI</span>
          </span>
        </Link>

        <div className="signup-hero">
          <h1 className="signup-hero-title">
            Protect Your Future<br />
            with <span className="gradient-text">AI Intelligence.</span>
          </h1>

          <p className="signup-hero-sub">
            Real-time risk mitigation and financial security for the modern gig professional.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="signup-right">
        <div className="signup-card card glass">
          <h2 className="signup-card-title">Create Account</h2>
          <p className="signup-card-sub">Join the platform</p>

          <form className="signup-form" onSubmit={handleSubmit}>

            <div className="form-row-2">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-input"
                  value={form.fullName} onChange={set('fullName')} required />
              </div>

              <div className="form-group">
                <label>Username</label>
                <input type="text" className="form-input"
                  value={form.username} onChange={set('username')} required />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-input"
                value={form.email} onChange={set('email')} required />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type={showPw ? 'text' : 'password'} className="form-input"
                value={form.password} onChange={set('password')} required />

              {form.password && strengthInfo && (
                <div className="pw-strength">
                  <div className="pw-bar">
                    <div className="pw-bar-fill"
                      style={{ width: strengthInfo.width, background: strengthInfo.color }} />
                  </div>
                  <span style={{ color: strengthInfo.color }}>{strengthInfo.label}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" className="form-input"
                value={form.confirm} onChange={set('confirm')} required />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Phone</label>
                <input type="text" className="form-input"
                  value={form.phone} onChange={set('phone')} />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select className="form-input"
                  value={form.role} onChange={set('role')}>
                  <option>Worker</option>
                  <option>Admin</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Create Account
            </button>
          </form>

          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>

        </div>
      </div>
    </div>
  )
}