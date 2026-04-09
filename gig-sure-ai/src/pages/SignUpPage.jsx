import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icons'
import './SignUpPage.css'
import api from '../services/api' // 🔥 IMPORTANT

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

/* ─── 3D Canvas Animation ─── */
function AnimatedCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Orbs configuration — 3D-looking glowing blobs
    const orbs = [
      { x: 0.72, y: 0.38, r: 0.28, vx: 0.00018, vy: 0.00012, hue: 28,  sat: 90, opacity: 0.55 },
      { x: 0.55, y: 0.65, r: 0.20, vx: -0.00015, vy: 0.00020, hue: 20, sat: 80, opacity: 0.40 },
      { x: 0.88, y: 0.70, r: 0.22, vx: 0.00010, vy: -0.00018, hue: 35, sat: 70, opacity: 0.35 },
      { x: 0.60, y: 0.20, r: 0.15, vx: -0.00020, vy: 0.00010, hue: 15, sat: 85, opacity: 0.30 },
    ]

    // Floating particles
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.00015,
      vy: (Math.random() - 0.5) * 0.00015,
      opacity: Math.random() * 0.5 + 0.1,
    }))

    let t = 0
    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      t += 0.005

      // Draw each orb with layered radial gradients for 3D depth effect
      orbs.forEach((orb, i) => {
        const cx = orb.x * W
        const cy = orb.y * H
        const r  = orb.r * Math.min(W, H)

        // Outer soft glow
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.8)
        glow.addColorStop(0,   `hsla(${orb.hue}, ${orb.sat}%, 50%, ${orb.opacity * 0.5})`)
        glow.addColorStop(0.5, `hsla(${orb.hue}, ${orb.sat}%, 40%, ${orb.opacity * 0.25})`)
        glow.addColorStop(1,   `hsla(${orb.hue}, ${orb.sat}%, 30%, 0)`)
        ctx.beginPath()
        ctx.arc(cx, cy, r * 1.8, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // Core orb with 3D highlight
        const core = ctx.createRadialGradient(
          cx - r * 0.25, cy - r * 0.25, r * 0.05,
          cx, cy, r
        )
        core.addColorStop(0,   `hsla(${orb.hue + 15}, 100%, 75%, ${orb.opacity * 0.9})`)
        core.addColorStop(0.3, `hsla(${orb.hue}, ${orb.sat}%, 55%, ${orb.opacity * 0.7})`)
        core.addColorStop(0.7, `hsla(${orb.hue - 10}, ${orb.sat - 10}%, 35%, ${orb.opacity * 0.6})`)
        core.addColorStop(1,   `hsla(${orb.hue - 20}, ${orb.sat - 20}%, 15%, 0)`)
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = core
        ctx.fill()

        // Specular highlight (top-left white sheen for 3D look)
        const spec = ctx.createRadialGradient(
          cx - r * 0.3, cy - r * 0.35, 0,
          cx - r * 0.1, cy - r * 0.15, r * 0.5
        )
        spec.addColorStop(0,   `rgba(255,255,255, 0.18)`)
        spec.addColorStop(0.5, `rgba(255,255,255, 0.06)`)
        spec.addColorStop(1,   `rgba(255,255,255, 0)`)
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = spec
        ctx.fill()

        // Animate position with sinusoidal drift
        orb.x += orb.vx + Math.sin(t + i * 1.2) * 0.0001
        orb.y += orb.vy + Math.cos(t + i * 0.8) * 0.0001
        if (orb.x < 0.3 || orb.x > 1.05) orb.vx *= -1
        if (orb.y < 0.1 || orb.y > 1.0)  orb.vy *= -1
      })

      // Draw floating particles
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 162, 80, ${p.opacity})`
        ctx.fill()

        p.x += p.vx + Math.sin(t * 0.3) * 0.00005
        p.y += p.vy + Math.cos(t * 0.2) * 0.00005
        if (p.x < 0 || p.x > 1) p.vx *= -1
        if (p.y < 0 || p.y > 1) p.vy *= -1
      })

      // Subtle mesh grid lines for depth perception
      ctx.strokeStyle = 'rgba(255, 122, 0, 0.04)'
      ctx.lineWidth = 1
      const gridStep = 60
      for (let gx = 0; gx < W; gx += gridStep) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke()
      }
      for (let gy = 0; gy < H; gy += gridStep) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="signup-canvas" aria-hidden="true" />
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
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Google Auth States
  const [googleAuthState, setGoogleAuthState] = useState('idle')
  const [googleOtp, setGoogleOtp] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [authContact, setAuthContact] = useState('')
  const [authMethod, setAuthMethod] = useState('email')

  const mockupAccounts = [
    { name: 'Racha Thanmay Sri Vardhan', email: 'rachathanmaysrivardhan07@gmail.com', letter: 'R', color: '#8d6e63' },
    { name: 'Racha Thanmay0718', email: 'rachatanmay0718@gmail.com', letter: 'R', color: '#e64a19' },
    { name: 'Racha Tanmay Sri Vardhan', email: '2300030971cseh1@gmail.com', letter: 'R', color: '#00897b' },
    { name: 'DIVYA', email: 'pdivya2836@gmail.com', letter: 'D', color: '#546e7a' },
    { name: 'Bunny', email: 'bunny30971@gmail.com', letter: 'B', color: '#5c6bc0' }
  ]

  const strength = getStrength(form.password)
  const strengthInfo = strength >= 0 ? STRENGTHS[strength] : null

  const set = (k) => (e) => {
    setErrorMsg('')
    setSuccessMsg('')
    setForm(f => ({ ...f, [k]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (form.password !== form.confirm) {
      setErrorMsg("Passwords do not match.")
      return
    }

    try {
      const res = await api.post("/auth/register", {
        name: form.fullName,
        username: form.username,
        email: form.email,
        password: form.password,
        phoneNumber: form.phone,
        role: form.role.toUpperCase()
      })
      setSuccessMsg("Account created successfully! Redirecting...")
      setTimeout(() => navigate("/login"), 2000)
    } catch (err) {
      setErrorMsg(err.response?.data || "Signup failed. Please try again.")
    }
  }

  const handleGoogleAuth = () => {
    // Redirect to Spring Boot's auto-generated Google OAuth2 authorization URL
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'
  }

  const handleAccountSelect = (email) => {
    setAuthContact(email)
    setGoogleAuthState('loading')
    setTimeout(() => setGoogleAuthState('contact_prompt'), 800)
  }

  const handleSendOtp = async (method) => {
    if (!authContact) {
      setErrorMsg("Please enter a valid email or mobile number.")
      return
    }
    setErrorMsg('')
    const realOtp = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(realOtp)
    setAuthMethod(method)
    setGoogleAuthState('sending_otp')
    
    try {
      await api.post("/auth/send-otp", {
        contact: authContact,
        method: method,
        otp: realOtp
      })
    } catch (err) {
      console.error("Failed to hit backend OTP endpoint", err)
    }

    setTimeout(() => {
      setGoogleAuthState('otp')
    }, 2000)
  }

  const handleGoogleOtpSubmit = async () => {
    setErrorMsg('')
    if (googleOtp !== generatedOtp) {
      setErrorMsg("Invalid Verification Code. Please check and try again.")
      return
    }

    // ✅ OTP matched! Auto-register via Google and log in directly — user never needs a password.
    // We generate a secure random password for the backend (stored hashed, user will never type it).
    const autoPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10).toUpperCase() + "@Gig1"
    const emailFromContact = authContact.includes('@') ? authContact : `google_${authContact.replace(/\D/g, '')}@gigshield.ai`
    const nameFromEmail = emailFromContact.split('@')[0].replace(/[^a-zA-Z ]/g, ' ').trim()

    setGoogleAuthState('sending_otp') // Show loader

    try {
      // Register the Google-verified user
      await api.post("/auth/register", {
        name: nameFromEmail,
        username: emailFromContact.split('@')[0],
        email: emailFromContact,
        password: autoPassword,
        phoneNumber: authContact.includes('@') ? '' : authContact,
        role: "WORKER"
      })
    } catch (registerErr) {
      // User may already exist — that's fine, proceed to login
      console.log("Register note:", registerErr.response?.data)
    }

    try {
      // Auto-login immediately — user is now authenticated
      await api.post("/auth/login", {
        email: emailFromContact,
        password: autoPassword
      })
      setSuccessMsg("✅ Google Verification Successful! Entering your dashboard...")
      setGoogleAuthState('verified')
      setTimeout(() => navigate("/worker"), 2000)
    } catch (loginErr) {
      setGoogleAuthState('otp')
      setErrorMsg("Verification passed but auto-login failed. Please use the Login page with your email.")
    }
  }

  return (
    <div className="signup-page">
      <AnimatedCanvas />
      
      <div className="signup-overlay" />

      {/* Top nav */}
      <header className="signup-header">
        <Link to="/" className="signup-brand-link">
          <div className="logo-shield-sm">
            <Icon name="shield" size={14} color="var(--on-primary-fixed)" strokeWidth={2.5} />
          </div>
          <span className="logo-text">
            GigShield <span className="logo-ai">AI</span>
          </span>
        </Link>
        <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Login</Link>
      </header>

      <main className="signup-main">
        {/* Left panel */}
        <div className="signup-left">
          <div className="signup-hero-tag">
            <span className="signup-live-dot" />
            <span>AI-Powered Protection · Live</span>
          </div>
          <h1 className="signup-hero-title">
            Sign Up and<br />
            <span className="gradient-text">Get Secured.</span>
          </h1>

          <p className="signup-hero-sub">
            Real-time risk mitigation and financial security for the modern gig professional.
            Create your account to start your journey.
          </p>
          
          <div className="signup-shield-badge">
            <div className="shield-badge-ring shield-ring-1" />
            <div className="shield-badge-ring shield-ring-2" />
            <div className="shield-badge-ring shield-ring-3" />
            <div className="shield-badge-core">
              <Icon name="shield" size={32} color="var(--primary)" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="signup-right">
          <div className="signup-card glass">
            {googleAuthState === 'idle' && (
              <div className="fade-in">
                <h2 className="signup-card-title">Create Account</h2>
                <p className="signup-card-sub">Join the platform</p>

                {errorMsg && (
                  <div style={{ background: 'rgba(255, 65, 54, 0.1)', border: '1px solid rgba(255, 65, 54, 0.4)', color: '#ff4136', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                    {errorMsg}
                  </div>
                )}
                
                {successMsg && (
                  <div style={{ background: 'rgba(46, 204, 64, 0.1)', border: '1px solid rgba(46, 204, 64, 0.4)', color: '#2ecc40', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                    {successMsg}
                  </div>
                )}

                <form className="signup-form" onSubmit={handleSubmit}>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" className="form-input" placeholder="John Doe"
                        value={form.fullName} onChange={set('fullName')} required />
                    </div>

                    <div className="form-group">
                      <label>Username</label>
                      <input type="text" className="form-input" placeholder="johndoe"
                        value={form.username} onChange={set('username')} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <div className="input-with-icon">
                      <input type="email" className="form-input" placeholder="name@domain.com"
                        value={form.email} onChange={set('email')} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <div className="input-with-icon">
                      <input type={showPw ? 'text' : 'password'} className="form-input input-with-suffix" placeholder="••••••••"
                        value={form.password} onChange={set('password')} required />
                      <button type="button" className="input-suffix-btn" onClick={() => setShowPw(v => !v)}>
                        <Icon name="eye" size={15} color="var(--on-surface-variant)" />
                      </button>
                    </div>

                    {form.password && strengthInfo && (
                      <div className="pw-strength">
                        <div className="pw-bar">
                          <div className="pw-bar-fill"
                            style={{ width: strengthInfo.width, background: strengthInfo.color }} />
                        </div>
                        <span className="pw-label" style={{ color: strengthInfo.color }}>{strengthInfo.label}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="input-with-icon">
                      <input type="password" className="form-input" placeholder="••••••••"
                        value={form.confirm} onChange={set('confirm')} required />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Phone</label>
                      <input type="text" className="form-input" placeholder="+1234567890"
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

                  <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                    Create Account
                    <Icon name="arrow_right" size={17} />
                  </button>
                </form>

                <div className="login-or-divider" style={{ margin: '2rem 0 1rem' }}>
                   <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }} />
                   <span style={{ margin: '0 1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>or register with</span>
                   <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }} />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="social-btn" type="button" onClick={handleGoogleAuth} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', color: 'rgba(255,255,255,0.85)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                  <button className="social-btn" type="button" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', color: 'rgba(255,255,255,0.85)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </button>
                </div>
              </div>
            )}

            {googleAuthState === 'account_chooser' && (
              <div className="fade-in" style={{ padding: '0.5rem', fontFamily: '"Google Sans", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                     <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                     <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                     <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                     <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                   </svg>
                   <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#e8eaed' }}>Sign in with Google</span>
                 </div>
                 
                 <div style={{ marginBottom: '2.5rem' }}>
                   <h2 style={{ fontSize: '1.8rem', fontWeight: 400, color: '#e8eaed', marginBottom: '0.4rem' }}>Choose an account</h2>
                   <p style={{ fontSize: '1rem', color: '#e8eaed', margin: 0 }}>
                     to complete registration with <strong style={{ color: '#8ab4f8', fontWeight: 500 }}>gigshield.ai</strong>
                   </p>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                   {mockupAccounts.map((acc, i) => (
                     <div key={i} onClick={() => handleAccountSelect(acc.email)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', cursor: 'pointer', borderBottom: i < mockupAccounts.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none', transition: 'background 0.2s', ...({ '&:hover': { background: 'rgba(255,255,255,0.05)' } }) }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                       <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: acc.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 600, flexShrink: 0 }}>
                         {acc.letter}
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column' }}>
                         <span style={{ color: '#e8eaed', fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.1rem' }}>{acc.name}</span>
                         <span style={{ color: '#9aa0a6', fontSize: '0.85rem' }}>{acc.email}</span>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {googleAuthState === 'loading' && (
              <div className="fade-in" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                 <div style={{ margin: '0 auto 2rem', width: '48px', height: '48px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                 <h3 style={{color: 'rgba(255,255,255,0.9)', marginBottom: '0.75rem', fontSize: '1.4rem'}}>Connecting to Google...</h3>
                 <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem'}}>Securing authentication channel</p>
                 <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}} />
              </div>
            )}

            {googleAuthState === 'contact_prompt' && (
              <div className="fade-in" style={{ padding: '1rem 0' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                   <button onClick={() => setGoogleAuthState('idle')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                   </button>
                   <h2 className="login-title" style={{ margin: 0, fontSize: '1.5rem' }}>Secure Delivery</h2>
                 </div>

                {errorMsg && (
                  <div style={{ background: 'rgba(255, 65, 54, 0.1)', border: '1px solid rgba(255, 65, 54, 0.4)', color: '#ff4136', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                    {errorMsg}
                  </div>
                )}
                 
                 <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem', marginBottom: '2rem' }}>
                   <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', margin: '0 0 1rem', lineHeight: 1.5 }}>
                     Where should we send your Verification Code?
                   </p>
                   <input type="text" className="form-input" style={{ marginBottom: 0 }} placeholder="Enter Mobile Number or Email ID" value={authContact} onChange={e => setAuthContact(e.target.value)} />
                 </div>

                 <div style={{ display: 'flex', gap: '1rem' }}>
                   <button className="btn-secondary" style={{ flex: 1, padding: '0.9rem', borderRadius: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }} onClick={() => handleSendOtp('call')}>
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                     Call Me
                   </button>
                   <button className="btn-primary" style={{ flex: 1, padding: '0.9rem', borderRadius: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }} onClick={() => handleSendOtp('email')}>
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                     Email OTP
                   </button>
                 </div>
              </div>
            )}

            {googleAuthState === 'sending_otp' && (
              <div className="fade-in" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                 <div style={{ margin: '0 auto 2rem', width: '48px', height: '48px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
                 <h3 style={{color: 'rgba(255,255,255,0.9)', marginBottom: '0.75rem', fontSize: '1.4rem'}}>{authMethod === 'call' ? 'Initiating Cloud Call...' : 'Transmitting Secure Email...'}</h3>
                 <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem'}}>Connecting to <strong>{authContact}</strong></p>
              </div>
            )}

            {googleAuthState === 'otp' && (
              <div className="fade-in" style={{ padding: '1rem 0' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                   <button onClick={() => setGoogleAuthState('contact_prompt')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                   </button>
                   <h2 className="login-title" style={{ margin: 0, fontSize: '1.5rem' }}>Identity Verification</h2>
                 </div>

                {errorMsg && (
                  <div style={{ background: 'rgba(255, 65, 54, 0.1)', border: '1px solid rgba(255, 65, 54, 0.4)', color: '#ff4136', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div style={{ background: 'rgba(46, 204, 64, 0.1)', border: '1px solid rgba(46, 204, 64, 0.4)', color: '#2ecc40', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                    {successMsg}
                  </div>
                )}
                 
                 <div style={{ padding: '1rem', background: 'rgba(255,122,0,0.08)', border: '1px solid rgba(255,122,0,0.2)', borderRadius: '12px', marginBottom: '2rem' }}>
                   <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
                     {authMethod === 'call' ? 'We are calling your mobile number now.' : 'OTP successfully sent to your email.'}
                   </p>
                   <p style={{ color: 'rgba(255,122,0,0.8)', fontSize: '0.8rem', margin: 0, fontWeight: 500 }}>
                     Sent to: {authContact}
                   </p>
                 </div>
                 
                 <div className="form-group" style={{ marginBottom: '2rem' }}>
                   <label style={{ color: 'rgba(255,255,255,0.8)' }}>Security Code (OTP)</label>
                   <input autoFocus type="text" maxLength="6" className="form-input" style={{ letterSpacing: '0.7em', fontSize: '1.5rem', textAlign: 'center', padding: '1rem' }} placeholder="• • • • • •" value={googleOtp} onChange={e => setGoogleOtp(e.target.value.replace(/[^0-9]/g, ''))} />
                   <p style={{marginTop: '0.75rem', fontSize: '0.75rem', color: '#ff851b', textAlign: 'center'}}>
                     *Check your console output or logs to retrieve verification code.
                   </p>
                 </div>

                 <button className="btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '50px', fontSize: '0.9rem' }} disabled={googleOtp.length < 4} onClick={handleGoogleOtpSubmit}>
                   Verify & Create Account
                 </button>
              </div>
            )}

            {googleAuthState === 'verified' && (
              <div className="fade-in" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                 <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(74, 225, 131, 0.15)', border: '2px solid rgba(74, 225, 131, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#4ae183', animation: 'scaleUp 0.3s ease-out' }}>
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                 </div>
                 <h3 style={{color: 'rgba(255,255,255,0.9)', marginBottom: '0.75rem', fontSize: '1.55rem'}}>Authentication Complete</h3>
                 <p style={{color: 'var(--primary)', fontSize: '0.95rem', fontWeight: 600}}>Establishing secure session...</p>
                 <style dangerouslySetInnerHTML={{__html: `@keyframes scaleUp { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}} />
              </div>
            )}

            <p className="signup-footer-text">
              Already have an account? <Link to="/login" className="signup-link">Login</Link>
            </p>

          </div>
        </div>
      </main>
    </div>
  )
}