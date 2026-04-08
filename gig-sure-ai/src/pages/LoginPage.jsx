import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icons'
import './LoginPage.css'
import api from '../services/api'

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

  return <canvas ref={canvasRef} className="login-canvas" aria-hidden="true" />
}

/* ─── Stats counter ─── */
function StatItem({ value, label }) {
  const numeric = parseFloat(value.replace(/[^0-9.]/g, ''))
  const isNumber = !isNaN(numeric) && numeric > 0
  const suffix = value.replace(/[0-9.]/g, '')
  const [display, setDisplay] = useState(isNumber ? 0 : value)

  useEffect(() => {
    if (!isNumber) return
    let start = 0
    const steps = 60
    const inc = numeric / steps
    let frame = 0
    const id = setInterval(() => {
      frame++
      start = Math.min(start + inc, numeric)
      setDisplay(start)
      if (frame >= steps) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [value])

  return (
    <div className="login-stat">
      <span className="login-stat-value gradient-text">
        {isNumber ? `${display.toFixed(value.includes('.') ? 1 : 0)}${suffix}` : value}
      </span>
      <span className="login-stat-label">{label}</span>
    </div>
  )
}

/* ─── Main Login Page ─── */
export default function LoginPage() {
  const [role, setRole]         = useState('worker')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [remember, setRemember] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post("/auth/login", {
        email: email,
        password: password
      })
      
      try {
        const profileRes = await api.get("/auth/profile");
        const userRole = profileRes.data.role?.toLowerCase() || role;
        navigate(userRole === 'admin' ? '/admin' : '/worker')
      } catch (profileError) {
        // Fallback to selected role
        navigate(role === 'admin' ? '/admin' : '/worker')
      }
    } catch (err) {
      console.error("Login Error:", err)
      alert(err.response?.data || "Login failed - Invalid Credentials")
    }
  }

  return (
    <div className="login-page">
      {/* Full-screen animated canvas */}
      <AnimatedCanvas />

      {/* Dark overlay for readability */}
      <div className="login-overlay" />

      {/* Top nav */}
      <header className="login-header">
        <Link to="/" className="login-brand-link">
          <div className="logo-shield-sm"><Icon name="shield" size={14} color="var(--on-primary-fixed)" strokeWidth={2.5} /></div>
          <span className="logo-text">GigShield <span className="logo-ai">AI</span></span>
        </Link>
        <Link to="/signup" className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Sign Up</Link>
      </header>

      {/* Content area */}
      <main className="login-main">
        {/* Left panel — hero copy */}
        <div className="login-left">
          <div className="login-hero-tag">
            <span className="login-live-dot" />
            <span>AI-Powered Protection Â· Live</span>
          </div>

          <h1 className="login-hero-title">
            Predictive<br />
            <span className="gradient-text">Stability</span>
          </h1>

          <p className="login-hero-sub">
            The world's first parametric insurance engine designed specifically for the gig economy.
            Secure your income with Luminescent Guardian technology.
          </p>

          <div className="login-stats">
            <StatItem value="99.8%" label="Risk Mitigation" />
            <div className="login-stat-divider" />
            <StatItem value="Instant" label="Payout Velocity" />
          </div>

          {/* Shield 3D badge */}
          <div className="login-shield-badge">
            <div className="shield-badge-ring shield-ring-1" />
            <div className="shield-badge-ring shield-ring-2" />
            <div className="shield-badge-ring shield-ring-3" />
            <div className="shield-badge-core">
              <Icon name="shield" size={32} color="var(--primary)" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Right panel — login card */}
        <div className="login-right">
          <div className="login-card glass">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-sub">Enter your credentials to access your secure guardian portal.</p>

            {/* Role toggle */}
            <div className="role-toggle">
              {['worker', 'admin'].map(r => (
                <button
                  key={r}
                  className={`role-btn ${role === r ? 'active' : ''}`}
                  onClick={() => setRole(r)}
                >
                  <Icon name={r === 'worker' ? 'person' : 'dashboard'} size={15} />
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email or Username</label>
                <div className="input-icon-wrap">
                  <span className="input-prefix-icon"><Icon name="person" size={15} color="var(--on-surface-variant)" /></span>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@gigshield.ai"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="form-input input-with-prefix"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="pw-label-row">
                  <label htmlFor="password">Password</label>
                  <a href="#" className="login-link" style={{ fontSize: '0.8rem' }}>Forgot Password?</a>
                </div>
                <div className="input-icon-wrap">
                  <span className="input-prefix-icon"><Icon name="shield" size={15} color="var(--on-surface-variant)" /></span>
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="form-input input-with-prefix input-with-suffix"
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" className="input-suffix-btn" onClick={() => setShowPw(v => !v)}>
                    <Icon name="eye" size={15} color="var(--on-surface-variant)" />
                  </button>
                </div>
              </div>

              <div className="login-remember-row">
                <label className="remember-label">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="remember-check" />
                  Remember Me
                </label>
              </div>

              <button type="submit" className="btn-primary login-submit btn-with-icon">
                Login to Secure Dashboard
                <Icon name="arrow_right" size={17} />
              </button>
            </form>

            <div className="login-or-divider"><span>or continue with</span></div>

            <div className="login-social-btns">
              <button className="social-btn" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className="social-btn" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>
            </div>

            <p className="login-footer-text">
              Don't have an account?{' '}
              <Link to="/signup" className="login-link">Sign Up</Link>
            </p>

            <div className="login-legal">
              <a href="#" className="login-link-muted">Privacy Policy</a>
              <span>Â·</span>
              <a href="#" className="login-link-muted">Terms of Service</a>
              <span>Â·</span>
              <a href="#" className="login-link-muted">Contact</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
