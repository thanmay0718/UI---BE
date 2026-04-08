import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Icon } from '../components/Icons'
import './CreatePolicy.css'
import api from '../services/api'

const ADMIN_NAV = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard'  },
  { id: 'policies',  icon: 'shield',    label: 'Policies'   },
  { id: 'claims',    icon: 'file',      label: 'Claims'     },
  { id: 'earnings',  icon: 'payments',  label: 'Earnings'   },
  { id: 'settings',  icon: 'cog',       label: 'Settings'   },
]

export default function CreatePolicyPage() {
  const [activeNav, setActiveNav] = useState('policies')
  
  // Dynamic fields replacing hardcoded structural data
  const [policyName, setPolicyName] = useState('Parametric Monsoon Guard v1')
  const [category, setCategory] = useState('Weather')
  const [oracleFeed, setOracleFeed] = useState('Real-time Weather Satellite API')
  const [description, setDescription] = useState('Automated parametric payout based on precise mm/hr rainfall thresholds.')
  
  const [rainfallThreshold, setRainfallThreshold] = useState(12.8)
  const [premium, setPremium] = useState(5.00)
  const [coverage, setCoverage] = useState(150.00)
  
  const [windEnabled, setWindEnabled] = useState(true)
  const [aqlEnabled, setAqlEnabled] = useState(false)
  const [confidence] = useState(94)

  const circumference = 2 * Math.PI * 36
  const dashOffset = circumference - (confidence / 100) * circumference

  const handleDeploy = async () => {
    try {
      await api.post('/api/v1/policy-templates', {
        policyName: policyName,
        category: category,
        oracleFeed: oracleFeed,
        description: description,
        triggers: `Rainfall >${rainfallThreshold} mm/hr`,
        premiumAmount: parseFloat(premium),
        coverageAmount: parseFloat(coverage),
        aiConfidence: confidence
      })
      alert("Policy deployed successfully to the marketplace!")
    } catch (err) {
      alert("Failed to deploy policy. " + (err.response?.data?.message || err.message))
    }
  }

  return (
    <DashboardLayout
      navItems={ADMIN_NAV}
      activeNav={activeNav}
      setActiveNav={setActiveNav}
      role="admin"
      username="Alex Mercer"
      subtitle="Chief Architect"
    >
      <div className="create-policy-page">
        {/* Header */}
        <div className="dash-header">
          <div>
            <p className="cp-breadcrumb">Admin Core Â· <span>GigShield AI Policy Architect / Sequencer ID: 8M43-GX</span></p>
            <h1 className="dash-title">
              Create New <span className="gradient-text">Parametric</span> Policy
            </h1>
          </div>
          <div className="dash-header-actions">
            <button className="btn-secondary">Save Draft</button>
            <button className="btn-primary btn-with-icon" onClick={handleDeploy}>
              <Icon name="check" size={15} /> Finalize Policy
            </button>
          </div>
        </div>

        {/* 3-column layout */}
        <div className="cp-layout">

          {/* Column 1: Policy Identity + AI Trigger Logic + Pricing */}
          <div className="cp-main">

            {/* Policy Identity */}
            <section className="card cp-section">
              <div className="cp-section-header">
                <span className="cp-section-dot" style={{ background: 'var(--primary)' }} />
                <h3>Policy Identity</h3>
              </div>
              <div className="form-group cp-field">
                <label>Policy Name</label>
                <input type="text" className="form-input" value={policyName} onChange={e => setPolicyName(e.target.value)} />
              </div>
              <div className="form-row-2">
                <div className="form-group cp-field">
                  <label>Category</label>
                  <select className="form-input form-select" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="Weather">Weather</option>
                    <option value="AQI">AQI</option>
                    <option value="Platform Outage">Platform Outage</option>
                  </select>
                </div>
                <div className="form-group cp-field">
                  <label>Oracle Feed</label>
                  <input type="text" className="form-input" value={oracleFeed} onChange={e => setOracleFeed(e.target.value)} />
                </div>
              </div>
              <div className="form-group cp-field">
                <label>Description</label>
                <textarea
                  className="form-input cp-textarea"
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </section>

            {/* AI Trigger Logic */}
            <section className="card cp-section">
              <div className="cp-section-header">
                <span className="cp-section-dot" style={{ background: 'var(--secondary)' }} />
                <h3>AI Trigger Logic</h3>
              </div>

              <div className="trigger-slider-row">
                <div className="trigger-item-label">
                  <Icon name="rain" size={16} color="var(--primary)" />
                  <span>Rainfall Threshold</span>
                  <span className="trigger-value gradient-text">{rainfallThreshold} mm/hr</span>
                </div>
                <input
                  type="range"
                  className="cp-slider"
                  min={1}
                  max={50}
                  step={0.1}
                  value={rainfallThreshold}
                  onChange={e => setRainfallThreshold(parseFloat(e.target.value))}
                />
                <div className="slider-labels">
                  <span>MODERATE</span><span>RISKY</span><span>EXTREME HAZARD</span>
                </div>
              </div>

              <div className="toggle-triggers">
                <div className="toggle-row">
                  <div className="toggle-label-group">
                    <Icon name="wind" size={16} color="var(--on-surface-variant)" />
                    <span>Wind Speed</span>
                    <span className="toggle-val">45 km/h</span>
                  </div>
                  <div className={`toggle ${windEnabled ? 'on' : ''}`} onClick={() => setWindEnabled(v => !v)} />
                </div>
                <div className="toggle-row">
                  <div className="toggle-label-group">
                    <Icon name="activity" size={16} color="var(--on-surface-variant)" />
                    <span>AQI Level</span>
                    <span className="toggle-disabled-label">{aqlEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className={`toggle ${aqlEnabled ? 'on' : ''}`} onClick={() => setAqlEnabled(v => !v)} />
                </div>
              </div>
            </section>

            {/* Custom Dynamic Pricing */}
            <section className="card cp-section">
              <div className="cp-section-header">
                <span className="cp-section-dot" style={{ background: 'var(--tertiary)' }} />
                <h3>Pricing &amp; Coverage</h3>
              </div>
              <div className="form-row-2">
                <div className="form-group cp-field">
                  <label>Premium Price (₹ / week)</label>
                  <div style={{position: 'relative'}}>
                     <span style={{position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'var(--on-surface-variant)'}}>₹</span>
                     <input type="number" step="0.01" className="form-input" style={{paddingLeft: '2rem'}} value={premium} onChange={e => setPremium(e.target.value)} />
                  </div>
                </div>
                <div className="form-group cp-field">
                  <label>Max Payout Coverage (₹ / event)</label>
                  <div style={{position: 'relative'}}>
                     <span style={{position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'var(--tertiary)'}}>₹</span>
                     <input type="number" step="0.01" className="form-input" style={{paddingLeft: '2rem', color:'var(--tertiary)', fontWeight:600}} value={coverage} onChange={e => setCoverage(e.target.value)} />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Column 2: AI Confidence + Policy Summary */}
          <div className="cp-sidebar">

            {/* AI Confidence Ring */}
            <div className="card cp-conf-card">
              <div className="cp-section-header">
                <span className="cp-section-dot" style={{ background: 'var(--primary)' }} />
                <h3>AI Confidence Risk</h3>
              </div>
              <div className="conf-ring-wrap">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="36" fill="none" stroke="var(--surface-container-high)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="36"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <span className="conf-percentage">{confidence}%</span>
              </div>
              <p className="conf-label">AI RELIABILITY</p>

              <div className="geo-trigger-preview">
                <p className="conf-sub-label">GEOGRAPHIC TERRITORY</p>
                <div className="geo-preview-box">
                  <div className="geo-pin"><Icon name="trending_up" size={18} color="var(--primary)" /></div>
                  <p className="geo-region-label">Global Zone Mapping</p>
                </div>
                <div className="geo-tags">
                  <span className="badge badge-active">Verified Set</span>
                  <span className="badge badge-warning">Cluster Band</span>
                  <span className="badge badge-info">+3 Regions</span>
                </div>
              </div>
            </div>

            {/* Policy Summary */}
            <div className="card cp-summary-card">
              <div className="cp-section-header">
                <span className="cp-section-dot" style={{ background: 'var(--secondary)' }} />
                <h3>Policy Summary</h3>
              </div>
              <div className="summary-rows">
                {[
                  ['Policy Name', policyName],
                  ['Trigger Type', category],
                  ['Est. Margin', `${(((coverage - premium) / coverage) * 100).toFixed(1)}%`],
                  ['Target Population', '+42,844 Gig Partners'],
                ].map(([k, v]) => (
                  <div key={k} className="summary-row">
                    <span className="summary-key">{k}</span>
                    <span className="summary-val">{v}</span>
                  </div>
                ))}
              </div>
              <button className="btn-primary btn-with-icon deploy-btn" onClick={handleDeploy}>
                <Icon name="send" size={15} /> Deploy Policy Now
              </button>
              <p className="deploy-note">Active in 1 hour. AI continuously monitors and pays within 90s of trigger.</p>
            </div>

            {/* AI Prediction */}
            <div className="card cp-prediction">
              <div className="prediction-header">
                <Icon name="activity" size={15} color="var(--tertiary)" />
                <span className="prediction-title">AI Prediction</span>
              </div>
              <p className="prediction-text">
                Based on 6-hour historical anomaly data, the AI Trigger is expected to fire 14 times in the forecast 30 days. Payout variance as low as Â±7%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
