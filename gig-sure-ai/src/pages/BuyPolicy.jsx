import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './BuyPolicy.css'
import api from '../services/api'
const PLANS = [
  {
    id: 'basic',
    name: 'Basic Shield',
    price: '₹9.99',
    period: '/week',
    coverage: '₹150',
    desc: 'Essential protection for part-time gig workers.',
    features: ['Rainfall Coverage', 'AQI Alerts', 'Weekly Reports'],
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro Guardian',
    price: '₹19.99',
    period: '/week',
    coverage: '₹350',
    desc: 'Comprehensive coverage for full-time gig workers.',
    features: ['Rainfall Coverage', 'AQI Spike Protection', 'Platform Outage Cover', 'Real-time Alerts', 'Priority Payouts'],
    highlight: true,
  },
  {
    id: 'elite',
    name: 'Elite Luminescent',
    price: '₹34.99',
    period: '/week',
    coverage: '₹750',
    desc: 'Maximum protection for high-earning gig professionals.',
    features: ['All Pro features', 'Traffic Disruption Cover', 'Custom Triggers', 'Dedicated AI Analyst', 'Instant Payouts'],
    highlight: false,
  },
]

const PLATFORMS = ['Uber', 'DoorDash', 'Lyft', 'Upwork', 'Fiverr', 'Instacart']

export default function BuyPolicy() {
  const [selected, setSelected] = useState('pro')
  const [step, setStep] = useState(1)
  const [plans, setPlans] = useState(PLANS)
  const [loading, setLoading] = useState(true)
  const [workerProfile, setWorkerProfile] = useState(null)
  const [connectedPlatforms, setConnectedPlatforms] = useState([])
  const [isConnecting, setIsConnecting] = useState(null)
  
  // Payment state
  const [cardNumber, setCardNumber] = useState('')
  const [cardExp, setCardExp] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const navigate = useNavigate()

  const handleConnect = (pl) => {
    if (connectedPlatforms.includes(pl)) return;
    setIsConnecting(pl)
    setTimeout(() => {
      setConnectedPlatforms(prev => [...prev, pl])
      setIsConnecting(null)
    }, 1000)
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [templatesRes, profileRes] = await Promise.all([
          api.get('/api/v1/policy-templates'),
          api.get('/auth/profile').catch(() => ({ data: null }))
        ])
        
        if (profileRes.data) {
           setWorkerProfile(profileRes.data)
        }

        if (templatesRes.data && templatesRes.data.length > 0) {
          const apiPlans = templatesRes.data.map((t, index) => ({
            id: t.id.toString(),
            name: t.policyName || t.category,
            price: `₹${t.premiumAmount?.toFixed(2) || '5.00'}`,
            period: '/week',
            coverage: `₹${t.coverageAmount?.toFixed(2) || '150.00'}`,
            desc: t.description || 'Parametric gig-worker protection plan.',
            features: [t.triggers || 'Real-time coverage', 'Instant Payouts', 'AI Monitor'],
            highlight: index === 1,
            dbId: t.id,
            rawPremium: t.premiumAmount,
            rawCoverage: t.coverageAmount
          }))
          setPlans(apiPlans)
          setSelected(apiPlans[0].id)
        }
      } catch (err) {
        console.error("Failed to load plans from DB", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const processPayment = async () => {
    setIsProcessing(true)
    
    try {
      const selectedPlan = plans.find(p => p.id === selected)
      
      if (workerProfile && workerProfile.id) {
         // 1. Create Policy via Backend
         const premiumAmt = selectedPlan.rawPremium || parseFloat(selectedPlan.price.replace('₹',''))
         const policyRes = await api.post('/api/v1/policies', {
           workerId: workerProfile.id,
           policyType: selectedPlan.name,
           premium: premiumAmt,
           coverageAmount: selectedPlan.rawCoverage || parseFloat(selectedPlan.coverage.replace('₹','')),
           duration: 6,
           startDate: new Date().toISOString().split('T')[0],
           endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]
         })
         
         const policyId = policyRes.data.id
         
         // 2. Record Payment via Backend Payment Module
         await api.post('/api/v1/payments', {
           workerId: workerProfile.id,
           policyId: policyId,
           amount: premiumAmt,
           paymentType: 'PREMIUM',
           paymentMethod: 'CARD',
           currency: 'INR',
           notes: 'Initial premium payment via Secure Checkout'
         })
      } else {
         console.log("No authenticated worker found in context, proceeding virtually...")
         // Simulate artificial delay for preview mode
         await new Promise(r => setTimeout(r, 1500))
      }
      
      setStep(4)
    } catch (err) {
      console.error("Failed processing backend transaction:", err)
      alert("Payment/Policy creation failed: " + (err.response?.data?.message || err.message))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="buy-policy-page">
      <div className="buy-bg-glow" />

      {/* Nav */}
      <nav className="buy-nav glass">
        <Link to="/" className="logo">️ GigShield <span className="logo-ai">AI</span></Link>
        <Link to="/login" className="btn-secondary">Sign In</Link>
      </nav>

      <div className="buy-content">
        <div className="buy-header">
          <p className="section-eyebrow">️ GET PROTECTED</p>
          <h1 className="buy-title">Choose Your <span className="gradient-text">Guardian Plan</span></h1>
          <p className="buy-subtitle">Start protecting your income in under 3 minutes.</p>
        </div>

        {/* Step indicator */}
        <div className="step-indicator">
          {['Choose Plan', 'Connect Accounts', 'Activate'].map((s, i) => (
            <div key={s} className={`step-pill ${step > i ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
              <span className="step-pill-num">{i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            {/* Plan cards */}
            <div className="plans-grid">
              {loading ? <p style={{color: 'white'}}>Loading live plans from GigShield AI Engine...</p> : plans.map(p => (
                <div
                  key={p.id}
                  className={`plan-card card ${selected === p.id ? 'plan-selected' : ''} ${p.highlight ? 'plan-highlight' : ''}`}
                  onClick={() => setSelected(p.id)}
                >
                  {p.highlight && <div className="plan-badge badge badge-active">Most Popular</div>}
                  <h3 className="plan-name">{p.name}</h3>
                  <p className="plan-desc">{p.desc}</p>
                  <div className="plan-price">
                    <span className="plan-price-value gradient-text">{p.price}</span>
                    <span className="plan-period">{p.period}</span>
                  </div>
                  <p className="plan-coverage">Up to <strong>{p.coverage}</strong> coverage per trigger</p>
                  <ul className="plan-features">
                    {p.features.map(f => (
                      <li key={f}><span className="check">✓</span> {f}</li>
                    ))}
                  </ul>
                  <button className={`plan-cta ${selected === p.id ? 'btn-primary' : 'btn-secondary'}`}>
                    {selected === p.id ? '✓ Selected' : 'Select Plan'}
                  </button>
                </div>
              ))}
            </div>
            <div className="buy-continue">
              <button disabled={loading} className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1rem' }} onClick={() => setStep(2)}>
                Continue with {plans.find(p => p.id === selected)?.name} →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="connect-step card">
            <h2>Connect Your Platforms</h2>
            <p>Link your gig accounts to establish your earnings baseline.</p>
            <div className="platforms-grid">
              {PLATFORMS.map(pl => {
                const isConn = connectedPlatforms.includes(pl);
                const isProcessingThis = isConnecting === pl;
                return (
                  <div 
                    key={pl} 
                    className={`platform-card ${isConn ? 'connected' : ''}`}
                    onClick={() => handleConnect(pl)}
                    style={{ cursor: isConn ? 'default' : 'pointer' }}
                  >
                    <span className="platform-icon"></span>
                    <span>{pl}</span>
                    {isProcessingThis && <span className="platform-status gradient-text" style={{marginLeft: 'auto'}}>Connecting...</span>}
                    {isConn && <span className="platform-status" style={{color: 'var(--primary)', marginLeft: 'auto'}}>✓ Connected</span>}
                  </div>
                )
              })}
            </div>
            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" disabled={connectedPlatforms.length === 0} onClick={() => setStep(3)}>Proceed to Payment →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="payment-step card">
            <h2>Secure Checkout <span className="badge badge-active" style={{marginLeft: '1rem'}}>SSL Encrypted</span></h2>
            <p style={{marginBottom: '2rem'}}>Complete your payment to activate <strong>{plans.find(p => p.id === selected)?.name}</strong>.</p>
            
            <div className="checkout-container" style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
               <div className="payment-form" style={{flex: '1 1 400px'}}>
                  <div className="form-group">
                     <label>Cardholder Name</label>
                     <input type="text" className="form-input" placeholder="e.g. Alex Mercer" value={cardName} onChange={e => setCardName(e.target.value)} />
                  </div>
                  <div className="form-group">
                     <label>Card Number</label>
                     <input type="text" className="form-input" placeholder="•••• •••• •••• ••••" maxLength="19" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
                  </div>
                  <div style={{display: 'flex', gap: '1rem'}}>
                     <div className="form-group" style={{flex: 1}}>
                        <label>Expiry Date</label>
                        <input type="text" className="form-input" placeholder="MM/YY" maxLength="5" value={cardExp} onChange={e => setCardExp(e.target.value)} />
                     </div>
                     <div className="form-group" style={{flex: 1}}>
                        <label>CVV</label>
                        <input type="text" className="form-input" placeholder="123" maxLength="4" value={cardCvv} onChange={e => setCardCvv(e.target.value)} />
                     </div>
                  </div>
               </div>
               
               <div className="checkout-summary card glass" style={{flex: '1 1 300px', background: 'var(--surface-container)'}}>
                  <h3 style={{marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem'}}>Order Summary</h3>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
                    <span>Plan:</span>
                    <strong>{plans.find(p => p.id === selected)?.name}</strong>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
                    <span>Billing Cycle:</span>
                    <span>Weekly</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)'}}>
                    <span style={{fontSize: '1.1rem', fontWeight: 600}}>Total Due:</span>
                    <span className="gradient-text" style={{fontSize: '1.5rem', fontWeight: 700}}>{plans.find(p => p.id === selected)?.price}</span>
                  </div>
                  
                  <button className="btn-primary" style={{width: '100%', padding: '1rem', fontSize: '1rem'}} disabled={!cardNumber || !cardExp || !cardCvv || isProcessing} onClick={processPayment}>
                    {isProcessing ? 'Processing Payment...' : 'Subscribe & Pay Now'}
                  </button>
                  <p style={{textAlign: 'center', fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: '1rem'}}>Payments processed securely via GigShield Financial Sandbox.</p>
               </div>
            </div>
            
            <div className="step-actions" style={{marginTop: '2rem'}}>
              <button className="btn-secondary" onClick={() => setStep(2)}>← Back</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="activate-step card">
            <div className="activate-icon"></div>
            <h2>You're Protected!</h2>
            <p>Your <strong>{plans.find(p => p.id === selected)?.name}</strong> plan is now active. The Luminescent Guardian AI is monitoring your risk in real time.</p>
            <button className="btn-primary" onClick={() => navigate('/worker?tab=earnings')}>
              Go to Payment History →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

