import { Link } from 'react-router-dom'
import { Icon } from '../components/Icons'
import './LandingPage.css'

const NAV_LINKS = ['Protection', 'Pricing', 'Company']

const STEPS = [
  { icon: 'link',     title: 'Connect Gig Accounts',  desc: 'Securely link your platform history (Uber, Upwork, DoorDash) using bank-grade encryption to establish your earnings baseline.' },
  { icon: 'activity', title: 'AI Risk Prediction',     desc: 'Our Luminescent Guardian AI monitors weather patterns, traffic congestion, and AQI in your working zones 24/7.' },
  { icon: 'zap',      title: 'Automatic Payouts',      desc: 'No claims, no paperwork, no waiting. If conditions drop below your threshold—heavy rain or hazardous air—funds are deposited instantly.' },
]

const TRIGGER_EVENTS = [
  { label: 'WEATHER TRIGGER',   name: 'Heavy Rain Spike', amount: '+₹84.50', icon: 'rain', color: 'var(--secondary)' },
  { label: 'POLLUTION TRIGGER', name: 'AQI Level > 150',  amount: '+₹42.00', icon: 'wind', color: 'var(--tertiary)' },
]

const STATS = [
  { value: '50K+',  label: 'Protected Workers' },
  { value: '₹2.4M', label: 'Payouts Delivered' },
  { value: '98%',   label: 'Payout Rate' },
  { value: '<2min', label: 'Avg Payout Time' },
]

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="nav apple-glass">
        <div className="nav-inner">
          <Link to="/" className="logo">
            <div className="logo-shield">
              <Icon name="shield" size={15} color="var(--on-primary-fixed)" strokeWidth={2.5} />
            </div>
            <span className="logo-text">GigShield <span className="logo-ai">AI</span></span>
          </Link>
          <ul className="nav-links">
            {NAV_LINKS.map(l => (
              <li key={l}><a href={`#${l.toLowerCase()}`} className="nav-link">{l}</a></li>
            ))}
          </ul>
          <div className="nav-actions">
            <Link to="/login" className="btn-secondary">Log In</Link>
            <Link to="/buy-policy" className="btn-primary">Get Protected</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-glow" />
        <div className="hero-content">
          <div className="hero-badge badge badge-active">
            <span className="pulse-dot" />
            AI-Powered Parametric Insurance
          </div>
          <h1 className="hero-title">
            Income Protection<br />
            <span className="gradient-text">Built for Gig Workers</span>
          </h1>
          <p className="hero-subtitle">
            Income protection against weather disruptions, air pollution spikes, and platform outages.
            Shield your earnings with real-time parametric AI.
          </p>
          <div className="hero-actions">
            <Link to="/buy-policy" className="btn-primary hero-cta btn-with-icon">
              <span>Start Protecting Earnings</span>
              <Icon name="arrow_right" size={18} />
            </Link>
            <Link to="/login" className="btn-secondary">
              View Dashboard
            </Link>
          </div>

          {/* Trigger cards */}
          <div className="trigger-cards">
            {TRIGGER_EVENTS.map(t => (
              <div key={t.name} className="trigger-card apple-glass">
                <span className="trigger-label badge badge-info">{t.label}</span>
                <div className="trigger-row">
                  <span className="trigger-icon-wrap" style={{ color: t.color }}>
                    <Icon name={t.icon} size={20} color={t.color} />
                  </span>
                  <span className="trigger-name">{t.name}</span>
                </div>
                <span className="trigger-amount" style={{ color: t.color }}>{t.amount}</span>
                <span className="trigger-sub">Deposited instantly</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          {STATS.map(s => (
            <div key={s.value} className="stat-item">
              <span className="stat-value gradient-text">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="how-section" id="protection">
        <div className="section-header">
          <p className="section-eyebrow">HOW IT WORKS</p>
          <h2 className="section-title">Traditional insurance is broken<br />for gig workers. We fixed it.</h2>
        </div>
        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div key={s.title} className="step-card apple-glass">
              <div className="step-number">{String(i + 1).padStart(2, '0')}</div>
              <div className="step-icon-wrap">
                <Icon name={s.icon} size={26} color="var(--primary)" strokeWidth={1.75} />
              </div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="pricing">
        <div className="cta-card apple-glass">
          <div className="cta-glow" />
          <p className="section-eyebrow">JOIN THE MOVEMENT</p>
          <h2 className="cta-title">Join 50,000+ gig workers who have secured their financial future</h2>
          <p className="cta-subtitle">Building the financial resilience layer for the world's most essential workforce.</p>
          <div className="cta-actions">
            <Link to="/buy-policy" className="btn-primary btn-with-icon">
              <Icon name="shield" size={16} /> Buy a Policy
            </Link>
            <Link to="/claim" className="btn-secondary btn-with-icon">
              <Icon name="send" size={15} /> Submit a Claim
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-shield"><Icon name="shield" size={14} color="var(--on-primary-fixed)" strokeWidth={2.5} /></div>
              <span className="logo-text" style={{ fontSize: '1.1rem' }}>GigShield <span className="logo-ai">AI</span></span>
            </div>
            <p>Luminescent Guardian Technology</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#">How it works</a>
              <a href="#">Risk Coverage</a>
              <a href="#">Parametric AI</a>
              <a href="#">Pricing</a>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <a href="#">Help Center</a>
              <a href="#">Community</a>
              <a href="#">Claims Guide</a>
              <a href="#">API Docs</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Â© 2024 GigShield AI. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
