import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { Icon } from '../components/Icons'
import './WorkerProfile.css'
import api from '../services/api'

const NAV_ITEMS = [
  { id: 'profile',      icon: 'person',    label: 'Worker Profile' },
  { id: 'dashboard',    icon: 'dashboard', label: 'Dashboard'      },
  { id: 'earnings',     icon: 'payments',  label: 'Earnings'       },
  { id: 'verification', icon: 'id_card',   label: 'Verification'   },
  { id: 'support',      icon: 'bell',      label: 'Support'        },
]

const KYC_FIELDS = [
  { label: 'Aadhaar Number', value: '•••• •••• ••••  4921',  masked: true },
  { label: 'PAN Card Number', value: 'ABCDE••••F',           masked: true },
  { label: 'Bank Name',       value: 'State Bank of India',  masked: false },
  { label: 'Account Number',  value: '34821098451',          masked: false },
]

const WORK_SECTORS = [
  { icon: 'trending_up', label: 'Food Delivery', tag: 'PRIMARY SEGMENT' },
  { icon: 'chart',       label: 'Grocery & Logistics', tag: 'SECONDARY SEGMENT' },
]

export default function WorkerProfilePage() {
  const [activeNav, setActiveNav] = useState('profile')
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/auth/profile')
        setProfile(res.data)
      } catch (err) {
        console.error("Profile load err:", err)
      }
    }
    loadData()
  }, [])
  
  const displayName = profile?.name || 'Arjun Sharma'
  const displayEmail = profile?.email || 'arjun.sharma@v...'
  const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      activeNav={activeNav}
      setActiveNav={setActiveNav}
      role="worker"
      username={displayName}
      subtitle="Gig Worker"
    >
      <div className="wprofile-page">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Profile &amp; Identity</h1>
            <p className="dash-subtitle">Manage your secure digital identity and work preferences.</p>
          </div>
          <div className="dash-header-actions">
            <button className="btn-secondary btn-with-icon">
              <Icon name="download" size={15} /> Export Data
            </button>
            <button className="btn-primary btn-with-icon" onClick={() => navigate('/worker/registration')}>
              <Icon name="edit" size={15} /> Complete KYC Registration
            </button>
          </div>
        </div>

        <div className="wprofile-grid">
          {/* MAIN LEFT COLUMN */}
          <div className="wprofile-main">

            {/* Personal Identity */}
            <section className="wprofile-section card">
              <div className="wsection-header">
                <span className="wsection-icon"><Icon name="person" size={16} color="var(--primary)" /></span>
                <h2>Personal Identity</h2>
              </div>
              <div className="personal-id-layout">
                <div className="personal-avatar-col">
                  <div className="profile-photo">
                    <div className="profile-photo-inner">{initials}</div>
                    <button className="photo-edit-btn"><Icon name="edit" size={12} color="var(--on-primary-fixed)" /></button>
                  </div>
                </div>
                <div className="personal-fields">
                  <div className="two-col-fields">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" className="form-input" defaultValue={displayName} disabled={!editing} />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <div className="verified-field">
                        <input type="email" className="form-input" defaultValue={displayEmail} disabled={!editing} />
                        <span className="verified-dot" title="Verified"><Icon name="check" size={12} color="var(--tertiary)" /></span>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <div className="phone-input-row">
                      <span className="phone-prefix">+91</span>
                      <input type="tel" className="form-input phone-main" defaultValue={profile?.phoneNumber || "98765 43210"} disabled={!editing} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Financial & KYC */}
            <section className="wprofile-section card">
              <div className="wsection-header">
                <span className="wsection-icon"><Icon name="payments" size={16} color="var(--secondary)" /></span>
                <h2>Financial &amp; KYC Verification</h2>
              </div>
              <div className="kyc-grid">
                {KYC_FIELDS.map(f => (
                  <div key={f.label} className="kyc-field">
                    <label>{f.label}</label>
                    <div className="kyc-value-row">
                      <span className="kyc-value">{f.value}</span>
                      {f.masked && <span className="kyc-verified-dot"><Icon name="check" size={11} color="var(--tertiary)" /></span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Work & Location */}
            <section className="wprofile-section card">
              <div className="wsection-header">
                <span className="wsection-icon"><Icon name="trending_up" size={16} color="var(--tertiary)" /></span>
                <h2>Work &amp; Location</h2>
              </div>
              <div className="work-location-grid">
                <div className="work-left">
                  <div className="income-stat">
                    <span className="income-value gradient-text">₹28,500</span>
                    <span className="income-label">Avg. Monthly Income</span>
                  </div>
                  <div className="work-sectors">
                    {WORK_SECTORS.map(s => (
                      <div key={s.label} className="sector-row">
                        <span className="sector-icon-wrap"><Icon name={s.icon} size={14} color="var(--primary)" /></span>
                        <div>
                          <p className="sector-name">{s.label}</p>
                          <p className="sector-tag">{s.tag}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="work-right">
                  <div className="form-group">
                    <label>Permanent Address</label>
                    <textarea
                      className="form-input addr-textarea"
                      defaultValue="Flat 402, Sai Residency, Sector 15, HSR Layout, Bangalore, Karnataka"
                      disabled={!editing}
                      rows={3}
                    />
                  </div>
                  <div className="two-col-fields">
                    <div className="form-group">
                      <label>Area</label>
                      <input type="text" className="form-input" defaultValue="HSR Layout" disabled={!editing} />
                    </div>
                    <div className="form-group">
                      <label>Pincode</label>
                      <input type="text" className="form-input" defaultValue="560102" disabled={!editing} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="wprofile-sidebar">
            {/* Verified Identity card */}
            <div className="verified-card">
              <div className="verified-icon-wrap">
                <Icon name="check" size={22} color="var(--tertiary)" strokeWidth={2.5} />
              </div>
              <h3>Verified Identity</h3>
              <p>Your KYC documents have been fully verified. You are eligible for high-value protection plans.</p>
              <div className="verified-level">
                <span className="verified-level-label">ACTIVE PROTECTION LEVEL:</span>
                <span className="verified-level-value badge badge-active">HIGH</span>
              </div>
            </div>

            {/* Upgrade CTA */}
            <button className="btn-primary upgrade-cta btn-with-icon">
              <Icon name="zap" size={16} /> Upgrade Protection
            </button>

            {/* Quick links */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h4 className="card-section-title" style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>Quick Links</h4>
              {[
                { icon: 'cog',    label: 'Settings' },
                { icon: 'logout', label: 'Logout' },
              ].map(l => (
                <button key={l.label} className="quick-link-btn">
                  <Icon name={l.icon} size={14} color="var(--on-surface-variant)" />
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
