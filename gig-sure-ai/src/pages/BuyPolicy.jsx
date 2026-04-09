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

  // Payment method state
  const [paymentMethodType, setPaymentMethodType] = useState('card') // 'card', 'upi', 'wallet', 'qr'
  const [upiId, setUpiId] = useState('')
  const [selectedWallet, setSelectedWallet] = useState('')
  const [showQr, setShowQr] = useState(false)

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
           paymentMethod: paymentMethodType.toUpperCase(),
           currency: 'INR',
           notes: `Payment via ${paymentMethodType.toUpperCase()}`
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
      <nav className="buy-nav apple-glass">
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
                  className={`plan-card apple-glass ${selected === p.id ? 'plan-selected' : ''} ${p.highlight ? 'plan-highlight' : ''}`}
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
          <div className="connect-step apple-glass">
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
          <div className="payment-step apple-glass">
            <h2>Secure Checkout <span className="badge badge-active" style={{marginLeft: '1rem'}}>SSL Encrypted</span></h2>
            <p style={{marginBottom: '2rem'}}>Complete your payment to activate <strong>{plans.find(p => p.id === selected)?.name}</strong>.</p>
            
            <div className="checkout-container" style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
               <div className="payment-form" style={{flex: '1 1 400px'}}>
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50px' }}>
                    {[{id: 'card', name: 'Credit Card'}, {id: 'upi', name: 'UPI ID'}, {id: 'wallet', name: 'Wallets'}, {id: 'qr', name: 'QR Scan'}].map(pm => (
                      <button 
                        key={pm.id}
                        style={{ 
                          flex: 1, 
                          padding: '0.65rem', 
                          border: 'none', 
                          borderRadius: '50px',
                          background: paymentMethodType === pm.id ? 'var(--primary)' : 'transparent', 
                          color: paymentMethodType === pm.id ? '#1c1c1e' : 'rgba(255,255,255,0.6)', 
                          fontWeight: paymentMethodType === pm.id ? 700 : 500,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                          boxShadow: paymentMethodType === pm.id ? '0 4px 12px rgba(255, 122, 0, 0.4)' : 'none'
                        }}
                        onClick={() => setPaymentMethodType(pm.id)}
                      >
                        {pm.name}
                      </button>
                    ))}
                  </div>

                  {paymentMethodType === 'card' && (
                    <div className="fade-in">
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
                            <input type="password" className="form-input" placeholder="123" maxLength="4" value={cardCvv} onChange={e => setCardCvv(e.target.value)} />
                         </div>
                      </div>
                    </div>
                  )}

                  {paymentMethodType === 'upi' && (
                    <div className="fade-in">
                      <div className="form-group">
                         <label>Enter your UPI ID</label>
                         <input type="text" className="form-input" placeholder="e.g. username@okhdfcbank" value={upiId} onChange={e => setUpiId(e.target.value)} />
                      </div>
                      <p style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: '0.5rem'}}>A payment request will be sent to your UPI app. Please approve within 5 minutes.</p>
                    </div>
                  )}

                  {paymentMethodType === 'wallet' && (
                    <div className="fade-in">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.85)', marginBottom: '1rem' }}>Select your Wallet</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                          {['PhonePe', 'Google Pay', 'Paytm', 'Amazon Pay'].map(wallet => (
                            <div 
                              key={wallet}
                              className={`apple-glass ${selectedWallet === wallet ? 'selected-wallet' : ''}`}
                              style={{ padding: '1rem', textAlign: 'center', cursor: 'pointer', border: selectedWallet === wallet ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)', background: selectedWallet === wallet ? 'rgba(255,122,0,0.1)' : 'rgba(0,0,0,0.2)' }}
                              onClick={() => setSelectedWallet(wallet)}
                            >
                              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: selectedWallet === wallet ? 'var(--primary)' : 'rgba(255,255,255,0.7)' }}>{wallet}</span>
                            </div>
                          ))}
                        </div>
                    </div>
                  )}

                  {paymentMethodType === 'qr' && (
                    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '1rem 0' }}>
                      <p style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', margin: 0, fontWeight: 500}}>Scan QR using any UPI app</p>
                      <div style={{ 
                         width: '200px', height: '200px', 
                         background: '#ffffff', 
                         borderRadius: '20px', 
                         display: 'flex', alignItems: 'center', justifyContent: 'center', 
                         padding: '12px',
                         boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 12px 30px rgba(0,0,0,0.5), 0 0 40px rgba(255, 122, 0, 0.15)'
                      }}>
                         <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=gigshield-premium-payment" alt="QR Code" style={{ width: '100%', height: '100%', borderRadius: '10px' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <p style={{fontSize: '0.75rem', color: 'rgba(224, 192, 175, 0.6)', margin: 0}}>Valid for 5 minutes. Do not refresh.</p>
                        <button style={{ 
                           background: 'rgba(255,255,255,0.06)', 
                           border: '1px solid rgba(255,255,255,0.1)', 
                           color: 'rgba(255,255,255,0.7)', 
                           padding: '0.5rem 1.25rem', 
                           borderRadius: '50px', 
                           fontSize: '0.75rem',
                           cursor: 'pointer',
                           transition: 'all 0.2s',
                        }} onClick={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; setShowQr(true) }}>
                           ↻ Regenerate QR
                        </button>
                      </div>
                    </div>
                  )}
               </div>
               
               <div className="checkout-summary" style={{flex: '1 1 300px', display: 'flex', flexDirection: 'column', padding: '1rem 0'}}>
                  <h3 style={{marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', color: 'rgba(255,255,255,0.9)'}}>Order Summary</h3>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
                    <span style={{color: 'rgba(255,255,255,0.6)'}}>Plan:</span>
                    <strong style={{color: 'rgba(255,255,255,0.9)'}}>{plans.find(p => p.id === selected)?.name}</strong>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
                    <span style={{color: 'rgba(255,255,255,0.6)'}}>Billing Cycle:</span>
                    <span style={{color: 'rgba(255,255,255,0.9)'}}>Weekly</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)'}}>
                    <span style={{fontSize: '1.1rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)'}}>Total Due:</span>
                    <span className="gradient-text" style={{fontSize: '1.75rem', fontWeight: 700}}>{plans.find(p => p.id === selected)?.price}</span>
                  </div>
                  
                  <button className="btn-primary" style={{width: '100%', padding: '1.1rem', fontSize: '1rem', borderRadius: '50px', boxShadow: '0 8px 24px rgba(255,122,0,0.3)'}} disabled={
                    isProcessing ||
                    (paymentMethodType === 'card' && (!cardNumber || !cardExp || !cardCvv)) ||
                    (paymentMethodType === 'upi' && !upiId.includes('@')) ||
                    (paymentMethodType === 'wallet' && !selectedWallet)
                  } onClick={processPayment}>
                    {isProcessing ? 'Processing...' : 'Subscribe & Pay Now'}
                  </button>
                  <p style={{textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '1.25rem', letterSpacing: '0.02em'}}>Payments processed securely via GigShield Financial Sandbox.</p>
               </div>
            </div>
            
            <div className="step-actions" style={{marginTop: '2rem'}}>
              <button className="btn-secondary" onClick={() => setStep(2)}>← Back</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="activate-step apple-glass">
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

