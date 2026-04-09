import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './ClaimSubmission.css'
import api from '../services/api'
import { Icon } from '../components/Icons'

const CLAIM_TYPES = [
  { id: 'rainfall', icon: 'water_drop', label: 'Heavy Rainfall', desc: 'Precipitation triggered income loss' },
  { id: 'aqi',      icon: 'air',      label: 'AQI Spike',      desc: 'Air quality above threshold' },
  { id: 'outage',   icon: 'router',       label: 'Platform Outage', desc: 'Service interruption loss' },
  { id: 'traffic',  icon: 'traffic',       label: 'Traffic Disruption', desc: 'Severe congestion impact' },
]

export default function ClaimSubmission() {
  const [step, setStep] = useState(1)
  const [type, setType] = useState('')
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successClaim, setSuccessClaim] = useState(null)
  const navigate = useNavigate()

  const canSubmit = type && date && amount && desc

  const handleClaimSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError('')
    try {
      const pRes = await api.get('/auth/profile')
      const workerId = pRes.data?.id
      if (!workerId) throw new Error("Worker not authenticated")

      let policyId = 1
      try {
        const polRes = await api.get(`/api/v1/policies`)
        const wPol = polRes.data.find(p => p.workerId === workerId)
        if (wPol) policyId = wPol.id
      } catch (e) {
        console.warn("Could not fetch policies, using fallback policyId")
      }

      const res = await api.post('/api/v1/claims', {
        workerId: workerId,
        policyId: policyId,
        amount: parseFloat(amount),
        description: `[${type.toUpperCase()}] Date: ${date} - ${desc}`,
        location: 'Default Location'
      })

      setSuccessClaim({
        id:     res.data?.id || '—',
        status: res.data?.status || 'PENDING',
        amount: parseFloat(amount),
        type:   CLAIM_TYPES.find(c => c.id === type)?.label || type,
        date:   date,
      })

      setTimeout(() => navigate('/worker?tab=claims'), 4000)

    } catch (err) {
      console.error("Failed to submit claim:", err)
      if (err.response?.status === 401) {
        setSubmitError("Session expired. Please log in again.")
      } else {
        setSubmitError("Failed to submit. " + (err.response?.data?.message || err.message))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ── Success Screen ── */
  if (successClaim) {
    return (
      <div className="claim-page">
        <div className="claim-bg-glow" />
        <nav className="buy-nav apple-glass">
          <Link to="/" className="logo">
            <Icon name="shield" size={20} color="var(--tertiary)" strokeWidth={2.5} />
            GigShield <span className="logo-ai">AI</span>
          </Link>
          <Link to="/worker?tab=claims" className="btn-secondary">Back to Claims</Link>
        </nav>
        <div className="claim-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
          <div style={{ textAlign: 'center', maxWidth: '480px', width: '100%' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(74,225,131,0.15)', border: '2px solid var(--tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Icon name="check_circle" size={40} color="var(--tertiary)" />
            </div>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--tertiary)', marginBottom: '0.5rem' }}>Claim Submitted Successfully</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.75rem', color: 'var(--on-surface)' }}>Claim <span style={{ color: 'var(--tertiary)' }}>Received</span></h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.7 }}>
              Our AI is verifying your claim. You'll see the status update in your claims dashboard within minutes.
            </p>

            <div className="card" style={{ padding: '1.5rem', textAlign: 'left', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>CLAIM REFERENCE</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>C-{successClaim.id}</span>
              </div>
              {[
                { label: 'Type',           value: successClaim.type },
                { label: 'Incident Date',  value: successClaim.date },
                { label: 'Claimed Amount', value: `\u20B9${successClaim.amount.toFixed(2)}` },
                { label: 'Status',         value: successClaim.status },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{r.label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    {r.label === 'Status' ? (
                      <span className={`badge ${r.value === 'APPROVED' ? 'badge-active' : r.value === 'FLAGGED' ? 'badge-error' : 'badge-warning'}`}>{r.value}</span>
                    ) : r.value}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link to="/worker?tab=claims" className="btn-primary btn-with-icon">
                View All Claims
              </Link>
              <Link to="/worker" className="btn-secondary">Dashboard</Link>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '1.5rem', opacity: 0.6 }}>
              Auto-redirecting to claims in 4 seconds...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="claim-page">
      <div className="claim-bg-glow" />

      <nav className="buy-nav apple-glass">
          <Link to="/" className="logo">
            <Icon name="shield" size={20} color="var(--tertiary)" strokeWidth={2.5} />
            GigShield <span className="logo-ai">AI</span>
          </Link>
        <Link to="/worker" className="btn-secondary">Back Dashboard</Link>
      </nav>

      <div className="claim-content">
        <div className="buy-header">
          <p className="section-eyebrow">FILE A CLAIM</p>
          <h1 className="buy-title">Claim <span className="gradient-text">Submission</span></h1>
          <p className="buy-subtitle">Our AI will verify your claim automatically — usually within 2 minutes.</p>
        </div>

        <div className="step-indicator">
          {['Claim Type', 'Details', 'Review & Submit'].map((s, i) => (
            <div key={s} className={`step-pill ${step > i ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
              <span className="step-pill-num">{i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>

        {submitError && (
          <div style={{ padding: '0.875rem 1rem', background: 'rgba(255,100,80,0.1)', border: '1px solid rgba(255,100,80,0.35)', borderRadius: '10px', color: '#ff6450', fontSize: '0.875rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span><Icon name="warning" size={18} /></span> {submitError}
          </div>
        )}

        {step === 1 && (
          <div className="claim-type-step">
            <h2 className="step-title-h2">What triggered your income loss?</h2>
            <div className="claim-types-grid">
              {CLAIM_TYPES.map(ct => (
                <div
                  key={ct.id}
                  className={`claim-type-card card ${type === ct.id ? 'selected' : ''}`}
                  onClick={() => setType(ct.id)}
                >
                  <span className="claim-type-icon"><Icon name={ct.icon} size={32} color="var(--on-surface)" /></span>
                  <h3>{ct.label}</h3>
                  <p>{ct.desc}</p>
                </div>
              ))}
            </div>
            <div className="step-actions">
              <button className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
              <button className="btn-primary" disabled={!type} onClick={() => setStep(2)}>Continue \u2192</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="claim-details-step card">
            <h2>Claim Details</h2>
            <p>Provide information about the incident so our AI can verify it.</p>
            <div className="claim-form">
              <div className="form-group">
                <label>Date of Incident</label>
                <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label>Estimated Income Loss (\u20B9)</label>
                <input type="number" className="form-input" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} min="1" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input claim-textarea" rows={4} placeholder="Describe how the event impacted your earnings..." value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
            </div>
            <div className="ai-note">
              <span>AI Note:</span>
              <p>Our AI cross-references your submission with real-time weather, AQI, and platform data — no paperwork needed.</p>
            </div>
            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary" disabled={!canSubmit} onClick={() => setStep(3)}>Review Claim \u2192</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="claim-review-step card">
            <h2>Review Your Claim</h2>
            <div className="review-items">
              <div className="review-item"><span>Trigger Type</span><strong>{CLAIM_TYPES.find(c => c.id === type)?.label}</strong></div>
              <div className="review-item"><span>Incident Date</span><strong>{date}</strong></div>
              <div className="review-item"><span>Claimed Amount</span><strong className="gradient-text">\u20B9{parseFloat(amount || 0).toFixed(2)}</strong></div>
              <div className="review-item"><span>Description</span><strong>{desc}</strong></div>
            </div>
            <div className="ai-note">
              <span><Icon name="bolt" size={18} /></span>
              <p>Upon submission, our AI instantly verifies eligibility. Average payout time: under 2 minutes.</p>
            </div>
            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setStep(2)}>\u2190 Back Edit</button>
              <button className="btn-primary" disabled={isSubmitting} onClick={handleClaimSubmit}>
                {isSubmitting ? "Submitting..." : "Submit Claim \u2192"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
