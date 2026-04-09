import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Icon } from '../components/Icons'
import api from '../services/api'
import './WorkerDashboard.css'

const PAYOUT_METHODS = [
  { name: 'Chase Business Checking', sub: 'xxxx-8823 Â· Primary', icon: 'payments', primary: true  },
  { name: 'PayPal Digital Wallet',   sub: 'you@email.com',        icon: 'zap',      primary: false },
]
const EARN_TREND = [30, 50, 42, 70, 58, 80, 65, 90, 75, 95]

/* ── Helper ── */
const statusColor = (s) => ({ completed: 'badge-active', processing: 'badge-info', pending: 'badge-warning', paid: 'badge-active', review: 'badge-warning' }[s] || 'badge-info')

/* ─────────────────────────────────── SECTION VIEWS ─────────────────────────────────── */

function DashboardView() {
  const [loading, setLoading] = useState(true)
  const [realStats, setRealStats] = useState({ payments: [], riskFeed: [] })

  useEffect(() => {
    async function loadDash() {
      try {
        const pRes = await api.get('/auth/profile').catch(() => ({ data: null }))
        if (pRes.data && pRes.data.id) {
           const [payRes, claimsRes] = await Promise.all([
             api.get(`/api/v1/payments/worker/${pRes.data.id}`),
             api.get('/api/v1/claims')
           ])
           setRealStats({ 
             payments: payRes.data, 
             claims: claimsRes.data.filter(c => c.workerId === pRes.data.id) 
           })
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    loadDash()
  }, [])

  const CHART_BARS = [40, 75, 55, 90, 45, 80, 60, 95, 50, 70, 85, 65]
  const recentPayments = realStats.payments?.slice(0, 3) || []

  return (
    <div className="section-content">
      <div className="worker-metrics">
        <div className="metric-card card">
          <div className="metric-card-header">
            <span className="metric-icon-wrap"><Icon name="rain" size={22} color="var(--secondary)" /></span>
            <span className="badge badge-active">Active</span>
          </div>
          <h3 className="metric-card-title">Rainfall Protection</h3>
          <p className="metric-card-desc">Automated coverage for intense precipitation affecting your delivery slots.</p>
          <div className="metric-grid">
            <div className="metric-item"><span className="metric-label">Coverage Limit</span><span className="metric-value">₹250.00</span></div>
            <div className="metric-item"><span className="metric-label">Protected Earnings</span><span className="metric-value gradient-text">₹1,200.00</span></div>
            <div className="metric-item"><span className="metric-label">Weekly Premium</span><span className="metric-value">₹12.50</span></div>
            <div className="metric-item"><span className="metric-label">Recent Claims</span><span className="metric-value">{realStats.claims ? realStats.claims.length : 0}</span></div>
          </div>
          <div style={{marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(255, 162, 80, 0.1)', border: '1px solid var(--tertiary)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <Icon name="zap" size={18} color="var(--tertiary)" />
            <div>
               <p style={{fontSize: '0.85rem', fontWeight: 600, color: 'var(--on-surface)'}}>Premium Payment Due</p>
               <p style={{fontSize: '0.75rem', color: 'var(--on-surface-variant)'}}>Your next premium of ₹12.50 will be auto-deducted this week.</p>
            </div>
          </div>
        </div>
        <div className="stat-cards-col">
          <div className="stat-mini card"><span className="stat-mini-label">Risk Reduction</span><span className="stat-mini-value" style={{ color: 'var(--tertiary)' }}>18%</span><span className="stat-mini-sub">↓ vs last month</span></div>
          <div className="stat-mini card"><span className="stat-mini-label">Next Payout Potential</span><span className="stat-mini-value gradient-text">₹84.50</span><span className="stat-mini-sub">Weather trigger active</span></div>
          <div className="stat-mini card"><span className="stat-mini-label">Active Policies</span><span className="stat-mini-value">3</span><span className="stat-mini-sub">Rainfall, AQI, Outage</span></div>
        </div>
      </div>
      <div className="worker-bottom">
        <div className="chart-card card">
          <div className="chart-header">
            <h3>Risk Analytics Trend</h3>
            <span className="badge badge-info">Last 12 Weeks</span>
          </div>
          <div className="bar-chart">
            {CHART_BARS.map((h, i) => (
              <div key={i} className="bar-col">
                <div className="bar" style={{ height: `${h}%` }} title={`Week ${i + 1}: ${h}%`} />
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <span className="legend-dot" style={{ background: 'var(--secondary)' }} />
            <span>Risk Score</span>
          </div>
        </div>
        <div className="risk-feed card">
          <h3 className="feed-title">Risk Feed</h3>
          {[{icon:'rain',title:'Heavy Rain',desc:'No immediate risks locally',time:'Live'}].map(f => (
            <div key={f.title} className="feed-item">
              <span className="feed-icon-wrap"><Icon name={f.icon} size={18} color="var(--primary)" /></span>
              <div className="feed-content"><p className="feed-name">{f.title}</p><p className="feed-desc">{f.desc}</p></div>
              <span className="feed-time">{f.time}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="activity-card card">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {loading ? <p style={{color:'var(--on-surface-variant)'}}>Loading activity...</p> : 
           recentPayments.length === 0 ? <p style={{color:'var(--on-surface-variant)'}}>No recent activity found.</p> :
           recentPayments.map(a => (
            <div key={a.id} className="activity-row">
              <div className="activity-event">
                <span className={`activity-dot dot-${a.status === 'COMPLETED' ? 'success' : 'warning'}`} />
                <span>{a.paymentType}</span>
              </div>
              <span style={{ color: a.paymentType === 'PREMIUM' ? 'var(--on-surface-variant)' : 'var(--tertiary)', fontWeight: 600 }}>
                {a.paymentType === 'PREMIUM' ? '-' : '+'}₹{parseFloat(a.amount).toFixed(2)}
              </span>
              <span className="activity-date">{new Date(a.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PoliciesView() {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWorkerPolicies() {
      try {
        const pRes = await api.get('/auth/profile').catch(() => ({ data: null }))
        if (pRes.data && pRes.data.id) {
           const res = await api.get(`/api/v1/policies?workerId=${pRes.data.id}`)
           setPolicies(res.data)
        }
      } catch (err) {
        console.error("Failed loading policies", err)
      } finally {
        setLoading(false)
      }
    }
    loadWorkerPolicies()
  }, [])

  return (
    <div className="section-content">
      <div className="policy-add-card apple-glass" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', marginBottom: '2.5rem', border: '1px dashed rgba(255, 182, 139, 0.4)', borderRadius: '20px', background: 'rgba(255, 122, 0, 0.05)', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none'
      }} onClick={() => document.querySelector('#invisible-buy-link').click()}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255, 182, 139, 0.15)', borderRadius: '50%', color: 'var(--primary)' }}>
               <Icon name="plus" size={20} />
            </div>
            <div>
               <h3 style={{ fontSize: '1.1rem', color: 'rgba(229, 226, 225, 0.95)', margin: '0 0 0.25rem' }}>Add New Coverage Plan</h3>
               <p style={{ fontSize: '0.85rem', color: 'rgba(224, 192, 175, 0.6)', margin: 0 }}>Discover an intelligent, parametric policy to protect your income.</p>
            </div>
         </div>
         <span className="btn-primary" style={{ padding: '0.675rem 1.5rem', borderRadius: '50px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Browse Plans</span>
         <Link to="/buy-policy" id="invisible-buy-link" style={{ display: 'none' }}></Link>
      </div>
      <div className="policies-list">
        {loading ? <p style={{color: 'var(--on-surface-variant)'}}>Loading active policies...</p> : policies.map(p => (
          <div key={p.id} className="policy-row card">
            <div className="policy-header">
              <div className="policy-meta">
                <span className="policy-id">P-{p.id}</span>
                <span className={`badge ${p.status === 'ACTIVE' ? 'badge-active' : 'badge-warning'}`}>{p.status || 'ACTIVE'}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="policy-since">Since {new Date(p.startDate).toLocaleDateString()}</span>
                <button className="btn-secondary btn-sm btn-with-icon"><Icon name="edit" size={13} /> Edit</button>
              </div>
            </div>
            <h3 className="policy-type">{p.policyType}</h3>
            <p className="policy-trigger">Duration: <strong>{p.duration} Months</strong></p>
            <div className="policy-stats">
              <div className="policy-stat"><span>Coverage</span><strong>₹{p.coverageAmount}</strong></div>
              <div className="policy-stat"><span>Premium</span><strong>₹{p.premium}</strong></div>
            </div>
          </div>
        ))}
        {!loading && policies.length === 0 && <p style={{color: 'var(--on-surface-variant)'}}>No active policies found.</p>}
      </div>
    </div>
  )
}

function ClaimsView() {
  const navigate = useNavigate()
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWorkerClaims() {
      try {
        const pRes = await api.get('/auth/profile').catch(() => ({ data: null }))
        if (pRes.data && pRes.data.id) {
           const res = await api.get('/api/v1/claims')
           setClaims(res.data.filter(c => c.workerId === pRes.data.id).slice(0, 5))
        }
      } catch (err) {
        console.error("Failed loading claims", err)
      } finally {
        setLoading(false)
      }
    }
    loadWorkerClaims()
  }, [])

  return (
    <div className="section-content">
      <div className="section-top-row">
        <div><h2 className="section-h2">Claims History</h2><p className="section-sub">All your past and active claims with payout status.</p></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary btn-with-icon" onClick={() => navigate('/worker/claims')}>
            <Icon name="activity" size={15} /> View All & Filter
          </button>
          <Link to="/claim" className="btn-primary btn-with-icon"><Icon name="plus" size={16} /> File Claim</Link>
        </div>
      </div>
      <div className="card table-card">
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Loading claims ledger...</div> : (
        <table className="worker-table">
          <thead><tr><th>Claim ID</th><th>Policy ID</th><th>Amount</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {claims.map(c => (
              <tr key={c.id}>
                <td className="claim-id-cell">C-{c.id}</td>
                <td>P-{c.policyId}</td>
                <td style={{ color: 'var(--tertiary)', fontWeight: 600 }}>&#8377;{c.amount || 0}</td>
                <td className="date-cell">{c.claimDate ? new Date(c.claimDate).toLocaleDateString() : 'N/A'}</td>
                <td><span className={`badge ${c.status==='APPROVED'?'badge-active':c.status==='FLAGGED'?'badge-error':'badge-warning'}`}>{c.status}</span></td>
                <td><button className="btn-secondary btn-sm btn-with-icon" onClick={() => navigate('/worker/claims')}><Icon name="eye" size={13} /> View</button></td>
              </tr>
            ))}
            {claims.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem', color:'var(--on-surface-variant)'}}>No claims filed yet. <Link to="/claim" style={{ color: 'var(--primary)' }}>File your first claim →</Link></td></tr>}
          </tbody>
        </table>
        )}
        {!loading && claims.length > 0 && (
          <div style={{ textAlign: 'center', padding: '1rem', borderTop: '1px solid rgba(88,66,53,0.15)' }}>
            <button className="btn-secondary btn-sm btn-with-icon" onClick={() => navigate('/worker/claims')}>
              <Icon name="arrow_down" size={13} /> View Full Claims History with Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


/* ── NEW PAYMENTS / EARNINGS VIEW matching Stitch ── */
function EarningsView() {
  const [chartView, setChartView] = useState('6M')
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [payoutMethods, setPayoutMethods] = useState([
    { name: 'Bank of America', sub: 'Checking •••• 4092', icon: 'account_balance', primary: true },
    { name: 'Cash App', sub: '$gigworker', icon: 'payments', primary: false }
  ]);

  const [modalConfig, setModalConfig] = useState(null);

  const handleAddPayoutMethod = () => {
    setModalConfig({
      type: 'form',
      title: 'Add Payment Method',
      message: 'Enter your financial institution details for secure fast payouts.',
      input1Placeholder: 'Bank or Platform Name (e.g., Chase)',
      input2Placeholder: 'Account Details (e.g., ending in 1234)',
      confirmText: 'Connect & Verify',
      onConfirm: (institution, identifier) => {
        setPayoutMethods(prev => [...prev, {
          name: institution,
          sub: identifier,
          icon: 'account_balance_wallet',
          primary: false
        }]);
        setTimeout(() => setModalConfig({
          type: 'info', title: 'Success', message: `${institution} successfully verified!`, confirmText: 'Done'
        }), 300);
      }
    });
  };

  useEffect(() => {
    async function loadWorkerPayments() {
      try {
        const pRes = await api.get('/auth/profile').catch(() => ({ data: null }))
        if (pRes.data && pRes.data.id) {
           const res = await api.get(`/api/v1/payments/worker/${pRes.data.id}`)
          setPayments(res.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)))
        }
      } catch (err) {
        console.error("Failed loading payments", err)
      } finally {
        setLoading(false)
      }
    }
    loadWorkerPayments()
  }, [])

  const showInfo = (title, message) => {
    setModalConfig({ type: 'info', title, message, confirmText: 'OK' });
  };

  return (
    <div className="section-content">
      {modalConfig && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '400px', padding: '2rem', animation: 'fadeInUp 0.3s ease', border: '1px solid rgba(255,122,0,0.2)' }}>
             <h3 style={{fontFamily:'var(--font-display)', marginBottom:'0.5rem'}}>{modalConfig.title}</h3>
             <p style={{color:'var(--on-surface-variant)', fontSize:'0.875rem', marginBottom:'1.5rem', lineHeight:1.5}}>{modalConfig.message}</p>
             
             {modalConfig.type === 'form' && (
                <div style={{display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'1.5rem'}}>
                  <input className="form-input" placeholder={modalConfig.input1Placeholder} id="modal-input-1" autoFocus />
                  <input className="form-input" placeholder={modalConfig.input2Placeholder} id="modal-input-2" />
                </div>
             )}

             <div style={{display:'flex', gap:'0.75rem', justifyContent:'flex-end'}}>
               <button className="btn-secondary" onClick={() => setModalConfig(null)}>Cancel</button>
               <button className="btn-primary" onClick={() => {
                  if(modalConfig.type === 'form') {
                     const v1 = document.getElementById('modal-input-1').value;
                     const v2 = document.getElementById('modal-input-2').value;
                     if(v1 && v2) modalConfig.onConfirm(v1, v2);
                  } else {
                     if(modalConfig.onConfirm) modalConfig.onConfirm();
                     setModalConfig(null);
                  }
               }}>{modalConfig.confirmText || 'OK'}</button>
             </div>
          </div>
        </div>
      )}

      {/* Top row */}
      <div className="earnings-top">
        {/* Total earnings card */}
        <div className="card earn-total-card">
          <p className="earn-total-label">TOTAL PROTECTED EARNINGS</p>
          <div className="earn-total-row">
            <h2 className="earn-total-value gradient-text">
              ₹{payments.filter(p => p.paymentType !== 'PREMIUM' && p.status === 'COMPLETED').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toFixed(2)}
            </h2>
            <span className="earn-copy-btn"><Icon name="file" size={18} color="var(--on-surface-variant)" /></span>
          </div>
          <div className="earn-growth"><span className="badge badge-active">Live</span><span className="earn-growth-label">Synchronized</span></div>
          <div className="earn-actions">
            <button className="btn-primary btn-with-icon" onClick={() => showInfo("Processing Withdrawal", "Your payout request of highest available balance has been added to the queue.")}><Icon name="payments" size={15} /> Withdraw Now</button>
            <button className="btn-secondary btn-with-icon" onClick={() => showInfo("Generating Report", "Building your financial report context... This should be ready momentarily.")}><Icon name="file" size={15} /> View Reports</button>
          </div>
        </div>

        {/* Next payout */}
        <div className="card earn-next-payout">
          <div className="earn-next-header">
            <p className="earn-total-label">NEXT PAYOUT</p>
            <span className="earn-live-dot" />
          </div>
          <h2 className="earn-next-value gradient-text">
            ₹{payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toFixed(2)}
          </h2>
          <p className="earn-next-sub">Estimated arrival: <strong>Pending Review</strong></p>
          <div className="earn-next-coverage">
            <span className="earn-coverage-label">Protected via AI Shield</span>
            <span className="badge badge-active">YES</span>
          </div>
          <p className="earn-next-note">Verified by GigShield engine. Waiting for Haenzel clearing.</p>
        </div>

        {/* Payout methods */}
        <div className="card earn-payout-methods">
          <div className="earn-methods-header">
            <h4 className="card-section-title" style={{ marginBottom: 0 }}>Payout Methods</h4>
            <button className="btn-secondary btn-sm btn-with-icon" onClick={handleAddPayoutMethod}><Icon name="plus" size={13} /> Add New</button>
          </div>
          {payoutMethods.map(m => (
            <div key={m.name} className="payout-method-row">
              <span className="pmethod-icon"><Icon name={m.icon} size={18} color="var(--primary)" /></span>
              <div className="pmethod-info">
                <p className="pmethod-name">{m.name}</p>
                <p className="pmethod-sub">{m.sub}</p>
                {m.primary && <span className="pmethod-primary badge badge-active">Primary</span>}
              </div>
              <button className="pmethod-arrow" onClick={() => showInfo("Payment Details", `Currently managing automated connection parameters for: ${m.name}.`)}><Icon name="arrow_right" size={16} color="var(--on-surface-variant)" /></button>
            </div>
          ))}
          <div className="auto-withdraw-notice">
            <Icon name="zap" size={14} color="var(--primary)" />
            <div>
              <p className="pmethod-name">Auto-Withdraw Active</p>
              <p className="pmethod-sub">Your earnings are automatically swept to your primary account every Friday at 6:00 PM EST.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Trend chart */}
      <div className="card">
        <div className="chart-header">
          <div>
            <h3>Earnings Trend</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: '0.2rem' }}>Visualizing your income stability over 6 months</p>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['1M', '6M', '1Y'].map(v => (
              <button key={v} className={`btn-sm ${chartView === v ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setChartView(v)}>{v}</button>
            ))}
          </div>
        </div>
        <div className="earn-bar-chart">
          {EARN_TREND.map((h, i) => (
            <div key={i} className="earn-bar-col">
              <div className={`earn-bar ${i === EARN_TREND.length - 1 ? 'earn-bar-highlight' : ''}`} style={{ height: `${h}%` }} />
              <span className="earn-bar-label">{['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'][i] || ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <div className="card table-card">
        <div className="earn-txn-header">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>Transaction History</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary btn-sm btn-with-icon" onClick={() => showInfo("Transaction Filters", "Advanced parameters for dates and transaction types will appear here.")}><Icon name="activity" size={13} /> Filters</button>
            <button className="btn-secondary btn-sm btn-with-icon" onClick={() => showInfo("Export Running", "Secure transaction ledger is generating. Your download will begin shortly.")}><Icon name="download" size={13} /> Export CSV</button>
          </div>
        </div>
        <table className="worker-table">
          <thead><tr><th>Payment ID</th><th>Transaction Date</th><th>Status</th><th>Type</th><th>Method</th><th>Amount</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>Loading payments...</td></tr> : 
             payments.length === 0 ? <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>No transaction history found.</td></tr> :
             payments.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="txn-platform">
                    <span className="txn-avatar" style={{background: 'var(--surface-container-high)', color: 'var(--primary)'}}>
                      <Icon name={p.paymentType === 'PREMIUM' ? 'payments' : 'arrow_down'} size={14} />
                    </span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>TXN-{p.id.toString().padStart(6, '0')}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Policy #{p.policyId}</p>
                    </div>
                  </div>
                </td>
                <td className="date-cell">{new Date(p.createdAt || Date.now()).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                <td><span className={`badge ${p.status === 'COMPLETED' ? 'badge-active' : (p.status === 'FLAGGED' ? 'badge-error' : (p.status === 'PENDING' ? 'badge-warning' : 'badge-info'))}`}>{p.status || 'SUCCESS'}</span></td>
                <td style={{ color: 'var(--on-surface-variant)' }}>{p.paymentType}</td>
                <td style={{ color: 'var(--on-surface-variant)' }}>{p.paymentMethod || 'Wallet'}</td>
                <td style={{ fontWeight: 700, color: p.paymentType === 'PREMIUM' ? 'var(--on-surface)' : 'var(--tertiary)' }}>
                   {p.paymentType === 'PREMIUM' ? '-' : '+'}₹{parseFloat(p.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ textAlign: 'center', padding: '1rem', borderTop: '1px solid rgba(88,66,53,0.15)' }}>
          <button className="btn-secondary btn-sm btn-with-icon" onClick={() => showInfo("Transactions", "Syncing historical logs into virtual memory... Data stream intact.")}><Icon name="arrow_down" size={13} /> Load More Transactions</button>
        </div>
      </div>
    </div>
  )
}

/* ── PROFILE — fully editable ── */
function ProfileView() {
  const [editing, setEditing] = useState(false);
  // Persistent Profile Logic
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('gigshield_profile');
    return saved ? JSON.parse(saved) : { name: 'Alex Rivera', email: 'alex.rivera@gigshield.ai', phone: '+1 (555) 012-3456', location: 'New York, NY 10001' };
  });
  
  const [photo, setPhoto] = useState(() => localStorage.getItem('gigshield_photo'));
  
  const [platforms, setPlatforms] = useState(() => {
    const saved = localStorage.getItem('gigshield_platforms');
    return saved ? JSON.parse(saved) : ['Uber', 'DoorDash', 'Lyft'];
  });
  
  const [modalConfig, setModalConfig] = useState(null);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const navigate = useNavigate()

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setPhoto(base64);
        localStorage.setItem('gigshield_photo', base64);
      };
      reader.readAsDataURL(file);
    }
  }

  const toggleEdit = () => {
    if (editing) {
      localStorage.setItem('gigshield_profile', JSON.stringify(form));
      setModalConfig({ type: 'info', title: 'Profile Secured', message: 'Your profile information has been securely updated and saved.' });
    }
    setEditing(!editing)
  }

  const linkPlatform = (name) => {
    if (!platforms.includes(name)) {
      const newList = [...platforms, name];
      setPlatforms(newList);
      localStorage.setItem('gigshield_platforms', JSON.stringify(newList));
      setModalConfig({ type: 'info', title: 'Platform Linked', message: `${name} has been successfully configured and connected to your account.` });
    }
  }

  return (
    <div className="section-content">
      {modalConfig && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '400px', padding: '2rem', animation: 'fadeInUp 0.3s ease', border: '1px solid rgba(255,122,0,0.2)' }}>
             <h3 style={{fontFamily:'var(--font-display)', marginBottom:'0.5rem'}}>{modalConfig.title}</h3>
             <p style={{color:'var(--on-surface-variant)', fontSize:'0.875rem', marginBottom:'1.5rem', lineHeight:1.5}}>{modalConfig.message}</p>
             <div style={{display:'flex', gap:'0.75rem', justifyContent:'flex-end'}}>
               <button className="btn-primary" onClick={() => setModalConfig(null)}>OK</button>
             </div>
          </div>
        </div>
      )}
      <div className="section-top-row">
        <div><h2 className="section-h2">My Profile</h2><p className="section-sub">Manage your account details and linked platforms.</p></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary btn-with-icon" onClick={toggleEdit}>
            <Icon name="edit" size={15} /> {editing ? 'Save Profile' : 'Edit Profile'}
          </button>
          <button className="btn-primary btn-with-icon" onClick={() => navigate('/worker/registration')}>
            <Icon name="shield" size={15} /> KYC Settings
          </button>
        </div>
      </div>
      <div className="profile-layout">
        <div className="card profile-card">
          {photo ? (
            <img src={photo} alt="Profile" className="profile-avatar-lg" style={{objectFit: 'cover', width: '100px', height: '100px'}} />
          ) : (
            <div className="profile-avatar-lg">{form.name ? form.name[0].toUpperCase() : 'A'}</div>
          )}
          {editing && (
            <label className="btn-secondary btn-sm btn-with-icon" style={{ marginTop: '0.5rem', cursor: 'pointer' }}>
              <Icon name="edit" size={13} /> Change Photo
              <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handlePhotoUpload} />
            </label>
          )}
          <h3>{form.name}</h3>
          <p className="profile-role">Gig Worker · Delivery &amp; Rideshare</p>
          <div className="profile-stats">
            <div><span>Member Since</span><strong>Jan 2024</strong></div>
            <div><span>Risk Score</span><strong style={{ color: 'var(--tertiary)' }}>Low (82)</strong></div>
            <div><span>Claims Filed</span><strong>4</strong></div>
          </div>
        </div>
        <div className="profile-details">
          {/* Editable account details */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <h4 className="card-section-title">Account Details</h4>
            <div className="profile-form-grid">
              {[
                { label: 'Full Name',  key: 'name',     type: 'text' },
                { label: 'Email',      key: 'email',    type: 'email' },
                { label: 'Phone',      key: 'phone',    type: 'tel' },
                { label: 'Location',   key: 'location', type: 'text' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label>{f.label}</label>
                  <input
                    type={f.type}
                    className="form-input"
                    value={form[f.key]}
                    onChange={set(f.key)}
                    disabled={!editing}
                    style={{ opacity: editing ? 1 : 0.8 }}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Connected platforms */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 className="card-section-title">Connected Platforms</h4>
            {platforms.map(pl => (
              <div key={pl} className="platform-row">
                <div className="platform-name"><Icon name="link" size={14} color="var(--on-surface-variant)" /> {pl}</div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="badge badge-active">Connected</span>
                  {editing && <button className="btn-secondary btn-sm" onClick={() => {
                    const next = platforms.filter(p => p !== pl);
                    setPlatforms(next);
                    localStorage.setItem('gigshield_platforms', JSON.stringify(next));
                  }}>Disconnect</button>}
                </div>
              </div>
            ))}
            {!platforms.includes('Upwork') && (
              <div className="platform-row">
                <div className="platform-name"><Icon name="link" size={14} color="var(--on-surface-variant)" /> Upwork</div>
                <button className="btn-secondary btn-sm btn-with-icon" onClick={() => linkPlatform('Upwork')}><Icon name="plus" size={12} /> Link</button>
              </div>
            )}
            {!platforms.includes('Fiverr') && (
              <div className="platform-row">
                <div className="platform-name"><Icon name="link" size={14} color="var(--on-surface-variant)" /> Fiverr</div>
                <button className="btn-secondary btn-sm btn-with-icon" onClick={() => linkPlatform('Fiverr')}><Icon name="plus" size={12} /> Link</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── SETTINGS — fully functional matching Stitch design ── */
function SettingsView() {
  const [notifs, setNotifs] = useState([
    { id: 'risk',    label: 'Risk trigger alerts',  desc: 'Get notified when a parametric trigger fires',   on: true  },
    { id: 'payout',  label: 'Payout confirmations', desc: 'Receive confirmation when funds are deposited',  on: true  },
    { id: 'report',  label: 'Weekly risk report',   desc: 'Summary of your coverage and risk environment',  on: false },
    { id: 'mkt',     label: 'Marketing emails',     desc: 'Product updates and platform news',              on: false },
  ])
  const [appExp, setAppExp] = useState({ darkMode: true, precisionMap: false, liveTelemety: true })
  const [aiTriggers, setAiTriggers] = useState([
    { id: 'weather', icon: 'rain',     label: 'Severe Weather Alert',  desc: 'Notify when precipitation exceeds 5.5in/hr in active work zones.', slider: 55, on: true  },
    { id: 'claims',  icon: 'file',     label: 'Automated Claims',      desc: 'Instantly file and stage protection if gig app goes offline for >15s.', on: true, tags: ['Uber', '+ DoorDash', '+ Bolt Now'] },
    { id: 'surge',   icon: 'trending_up', label: 'Price Surge Guard', desc: 'Alert me when surge pricing is 3x baseline for my region.',          on: false },
  ])
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [modalConfig, setModalConfig] = useState(null)
  
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('gigshield_profile_alt');
    return saved ? JSON.parse(saved) : { name: 'Marcus Chen', display: 'Chen_Deliveries', email: 'm.chen@gigshield.ai' };
  })
  const [editProfile, setEditProfile] = useState(false)

  const handleSaveSettings = () => {
    localStorage.setItem('gigshield_profile_alt', JSON.stringify(profile));
    setEditProfile(false);
    setModalConfig({ type: 'info', title: 'Changes Saved', message: 'Your security protocols and profile settings were updated natively.' });
  }

  const toggleNotif = id => setNotifs(n => n.map(x => x.id === id ? { ...x, on: !x.on } : x))
  const toggleApp = k => setAppExp(a => ({ ...a, [k]: !a[k] }))
  const toggleTrigger = id => setAiTriggers(t => t.map(x => x.id === id ? { ...x, on: !x.on } : x))
  const setSlider = (id, val) => setAiTriggers(t => t.map(x => x.id === id ? { ...x, slider: val } : x))

  return (
    <div className="section-content">
      {modalConfig && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '400px', padding: '2rem', animation: 'fadeInUp 0.3s ease', border: '1px solid rgba(255,122,0,0.2)' }}>
             <h3 style={{fontFamily:'var(--font-display)', marginBottom:'0.5rem'}}>{modalConfig.title}</h3>
             <p style={{color:'var(--on-surface-variant)', fontSize:'0.875rem', marginBottom:'1.5rem', lineHeight:1.5}}>{modalConfig.message}</p>
             <div style={{display:'flex', gap:'0.75rem', justifyContent:'flex-end'}}>
               <button className="btn-primary" onClick={() => setModalConfig(null)}>OK</button>
             </div>
          </div>
        </div>
      )}
      <div>
        <p className="section-eyebrow" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>WORKER PREFERENCES</p>
        <h2 className="section-h2">Security &amp; Automations</h2>
      </div>

      <div className="settings-grid">
        {/* Profile Identity */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"><Icon name="person" size={15} color="var(--primary)" /></span>
            <h4>Profile Identity</h4>
            <button className="settings-edit-btn" onClick={() => setEditProfile(e => !e)}>
              <Icon name="edit" size={14} color={editProfile ? 'var(--primary)' : 'var(--on-surface-variant)'} />
            </button>
          </div>
          <div className="settings-profile-row">
            <div className="settings-avatar">MC</div>
            <div className="settings-profile-fields">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Full Name</label>
                  <input className="form-input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} disabled={!editProfile} />
                </div>
                <div className="form-group">
                  <label>Display Name</label>
                  <input className="form-input" value={profile.display} onChange={e => setProfile(p => ({ ...p, display: e.target.value }))} disabled={!editProfile} />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} disabled={!editProfile} style={{ paddingLeft: '2rem' }} />
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}><Icon name="send" size={13} color="var(--on-surface-variant)" /></span>
                </div>
              </div>
              {editProfile && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button className="btn-primary btn-sm" onClick={handleSaveSettings}>Save</button>
                  <button className="btn-secondary btn-sm" onClick={() => setEditProfile(false)}>Cancel</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* App Experience */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"><Icon name="dashboard" size={15} color="var(--secondary)" /></span>
            <h4>App Experience</h4>
          </div>
          {[
            { key: 'darkMode',      label: 'Dark Mode',      desc: 'Luminescent interface' },
            { key: 'precisionMap',  label: 'Precision Map',  desc: 'Satellite street view' },
            { key: 'liveTelemety',  label: 'Live Telemetry', desc: 'Real-time risk data' },
          ].map(x => (
            <div key={x.key} className="setting-row">
              <div><p className="setting-label">{x.label}</p><p className="setting-desc">{x.desc}</p></div>
              <div className={`toggle ${appExp[x.key] ? 'on' : ''}`} onClick={() => toggleApp(x.key)} />
            </div>
          ))}
          <button className="btn-secondary btn-sm" style={{ marginTop: '0.75rem', width: '100%' }} onClick={() => setAppExp({ darkMode: true, precisionMap: false, liveTelemety: true })}>
            Reset to Defaults
          </button>
        </div>

        {/* Shield Core (Security) */}
        <div className="card settings-card settings-card-wide">
          <div className="settings-card-header">
            <span className="settings-card-icon"><Icon name="shield" size={15} color="var(--tertiary)" /></span>
            <h4>Shield Core</h4>
          </div>

          {/* 2FA */}
          <div className="shield-2fa-row">
            <div className="shield-section-label">Two-Factor Authentication</div>
            <span className="badge badge-active">ACTIVE</span>
          </div>
          <p className="setting-desc" style={{ marginBottom: '0.875rem' }}>Protect your account with biometric or SMS verification.</p>
          <button className="btn-secondary btn-sm btn-with-icon" style={{ marginBottom: '1.5rem' }}><Icon name="shield" size={13} /> Manage 2FA</button>

          {/* Change password */}
          <div className="shield-section-label">Change Password</div>
          <p className="setting-desc" style={{ marginBottom: '0.875rem' }}>Last changed 42 days ago</p>
          <div className="pw-change-form">
            <input className="form-input" type="password" placeholder="Current password" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} />
            <input className="form-input" type="password" placeholder="New password" value={pw.next} onChange={e => setPw(p => ({ ...p, next: e.target.value }))} />
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}
              onClick={() => { if (pw.current && pw.next) { alert('Password updated!'); setPw({ current: '', next: '', confirm: '' }) }}}>
              Update Credentials
            </button>
          </div>
        </div>

        {/* AI Trigger Protocols */}
        <div className="card settings-card settings-card-wide">
          <div className="settings-card-header">
            <span className="settings-card-icon"><Icon name="zap" size={15} color="var(--primary)" /></span>
            <h4>AI Trigger Protocols</h4>
          </div>
          {aiTriggers.map(t => (
            <div key={t.id} className="ai-trigger-row">
              <div className="ai-trigger-top">
                <div className="ai-trigger-icon-wrap"><Icon name={t.icon} size={16} color="var(--primary)" /></div>
                <div className="ai-trigger-info">
                  <div className="ai-trigger-label-row">
                    <span className="ai-trigger-label">{t.label}</span>
                    <span className={`badge ${t.on ? 'badge-active' : 'badge-warning'}`}>{t.on ? 'ACTIVE' : 'DISABLED'}</span>
                  </div>
                  <p className="setting-desc">{t.desc}</p>
                  {t.tags && <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.5rem' }}>{t.tags.map(tg => <span key={tg} className="badge badge-info" style={{ fontSize: '0.6rem' }}>{tg}</span>)}</div>}
                </div>
                <div className={`toggle ${t.on ? 'on' : ''}`} onClick={() => toggleTrigger(t.id)} />
              </div>
              {t.slider !== undefined && (
                <div className="ai-trigger-slider">
                  <input type="range" className="cp-slider" min={0} max={100} value={t.slider} onChange={e => setSlider(t.id, +e.target.value)} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div className="card settings-card settings-card-wide">
          <div className="settings-card-header">
            <span className="settings-card-icon"><Icon name="bell" size={15} color="var(--secondary)" /></span>
            <h4>Notifications</h4>
          </div>
          {notifs.map(s => (
            <div key={s.id} className="setting-row">
              <div><p className="setting-label">{s.label}</p><p className="setting-desc">{s.desc}</p></div>
              <div className={`toggle ${s.on ? 'on' : ''}`} onClick={() => toggleNotif(s.id)} />
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="card settings-card settings-card-wide danger-zone-card">
          <div className="danger-zone-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Icon name="alert" size={18} color="var(--error)" />
              <div>
                <p className="setting-label" style={{ color: 'var(--error)' }}>Danger Zone</p>
                <p className="setting-desc">Permanently deactivate your GigShield AI coverage and data history.</p>
              </div>
            </div>
            <button className="btn-danger btn-with-icon" onClick={() => { if (window.confirm('Are you sure? This will permanently delete your account.')) alert('Account terminated.') }}>
              <Icon name="logout" size={14} /> Terminate Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── NAV CONFIG ── */
const NAV_ITEMS = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'policies',  icon: 'shield',    label: 'Policies'  },
  { id: 'claims',    icon: 'file',      label: 'Claims'    },
  { id: 'earnings',  icon: 'payments',  label: 'Payment History'  },
  { id: 'profile',   icon: 'person',    label: 'Profile'   },
  { id: 'settings',  icon: 'cog',       label: 'Settings'  },
]
const SECTION_MAP = { dashboard: DashboardView, policies: PoliciesView, claims: ClaimsView, earnings: EarningsView, profile: ProfileView, settings: SettingsView }
const TITLES = {
  dashboard: { title: 'AI Risk Analysis',   subtitle: 'Your personalized income protection overview' },
  policies:  { title: 'My Policies',        subtitle: 'Manage and view your parametric coverage' },
  claims:    { title: 'Claims',             subtitle: 'History and status of all your claims' },
  earnings:  { title: 'Payments & Earnings',subtitle: 'Track earnings, payouts, and withdrawal history' },
  profile:   { title: 'Profile',            subtitle: 'Your account and platform connections' },
  settings:  { title: 'Account Configuration', subtitle: 'Security, automations, and AI trigger protocols' },
}

export default function WorkerDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('dashboard')
  const [userProfile, setUserProfile] = useState(null)
  const [kycDone, setKycDone] = useState(true) // default true to prevent flash
  const [showKycPopup, setShowKycPopup] = useState(false)

  // Load real user profile for sidebar & KYC status check
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get('/auth/profile')
        if (res.data) {
          setUserProfile(res.data)
          // Check if KYC is complete
          const kycStatus = localStorage.getItem('gigshield_kyc_done')
          // Also check if worker profile exists in backend
          try {
            const wRes = await api.get('/api/v1/workers')
            const myWorker = wRes.data.find(w => w.email === res.data.email)
            const isKycComplete = !!myWorker || kycStatus === 'true'
            setKycDone(isKycComplete)
            setShowKycPopup(!isKycComplete)
          } catch {
            const isKycComplete = kycStatus === 'true'
            setKycDone(isKycComplete)
            setShowKycPopup(!isKycComplete)
          }
        }
      } catch (err) {
        // Not logged in or no session
      }
    }
    loadProfile()
  }, [])

  // Set active tab if query param changes or on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab && TITLES[tab]) {
      setActiveNav(tab)
    }
  }, [location.search])

  const { title, subtitle } = TITLES[activeNav] || TITLES.dashboard
  const ActiveSection = SECTION_MAP[activeNav] || DashboardView

  // Get display name: from localStorage profile or from backend
  const savedProfile = (() => { try { return JSON.parse(localStorage.getItem('gigshield_profile')) } catch { return null } })()
  const displayName = savedProfile?.name || userProfile?.username || userProfile?.email || 'Worker'
  const displayPhoto = localStorage.getItem('gigshield_photo')

  return (
    <DashboardLayout navItems={NAV_ITEMS} activeNav={activeNav} setActiveNav={setActiveNav} role="worker" username={displayName} subtitle="Gig Worker" userPhoto={displayPhoto}>
      {/* KYC Priority Popup */}
      {showKycPopup && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div style={{
            width: '100%', maxWidth: '520px', background: 'var(--surface-container)',
            border: '2px solid var(--primary)', borderRadius: '20px', padding: '2.5rem',
            boxShadow: '0 0 60px rgba(255,122,0,0.25)', animation: 'fadeInUp 0.35s ease',
            position: 'relative', textAlign: 'center'
          }}>
            {/* Pulsing shield icon */}
            <div style={{ position: 'relative', display: 'inline-flex', marginBottom: '1.5rem' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,122,0,0.15)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'kycPulse 2s ease-in-out infinite' }}>
                <Icon name="shield" size={32} color="var(--primary)" />
              </div>
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--error)', border: '2px solid var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff' }}>!</div>
            </div>
            
            <div style={{ background: 'rgba(255,122,0,0.1)', border: '1px solid rgba(255,122,0,0.3)', borderRadius: '8px', padding: '0.4rem 1rem', display: 'inline-block', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.12em', color: 'var(--primary)', textTransform: 'uppercase' }}>Action Required</span>
            </div>
            
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '0.75rem', color: 'var(--on-surface)' }}>
              Complete Your KYC Verification
            </h2>
            <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Your account is created! To activate GigShield AI protection and start filing claims, 
              you must complete <strong style={{ color: 'var(--on-surface)' }}>KYC verification</strong> first.
              This only takes 2 minutes.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
              {[
                { icon: 'person', label: 'Identity', desc: 'Aadhaar & PAN' },
                { icon: 'payments', label: 'Banking', desc: 'Account details' },
                { icon: 'shield', label: 'Protection', desc: 'AI coverage active' },
              ].map(s => (
                <div key={s.label} style={{ padding: '0.875rem 0.5rem', background: 'rgba(255,122,0,0.06)', border: '1px solid rgba(255,122,0,0.15)', borderRadius: '10px' }}>
                  <Icon name={s.icon} size={20} color="var(--primary)" />
                  <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--on-surface)', margin: '0.375rem 0 0.125rem' }}>{s.label}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                className="btn-primary btn-with-icon"
                style={{ padding: '0.875rem 2rem', fontSize: '1rem', background: 'linear-gradient(135deg, var(--primary), #ffa34d)', boxShadow: '0 4px 20px rgba(255,122,0,0.4)' }}
                onClick={() => { setShowKycPopup(false); navigate('/worker/registration') }}
              >
                <Icon name="shield" size={18} /> Start KYC Verification →
              </button>
              <button
                className="btn-secondary"
                style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', opacity: 0.7 }}
                onClick={() => setShowKycPopup(false)}
              >
                Later
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '1rem' }}>
              ⚠ You won't be able to file claims until KYC is complete
            </p>
          </div>
        </div>
      )}

      {/* KYC Banner (persistent, shown after dismissing the popup) */}
      {!kycDone && !showKycPopup && (
        <div style={{
          margin: '1rem 2rem 0',
          padding: '0.875rem 1.25rem',
          background: 'linear-gradient(135deg, rgba(255,122,0,0.12), rgba(255,122,0,0.06))',
          border: '1px solid rgba(255,122,0,0.4)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', gap: '1rem',
          animation: 'kycBannerPulse 3s ease-in-out infinite'
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,122,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="alert" size={16} color="var(--primary)" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary)' }}>KYC Verification Pending</p>
            <p style={{ margin: 0, fontSize: '0.775rem', color: 'var(--on-surface-variant)', marginTop: '0.1rem' }}>Complete your KYC to unlock claim filing and full protection coverage.</p>
          </div>
          <button
            className="btn-primary btn-sm btn-with-icon"
            style={{ flexShrink: 0 }}
            onClick={() => navigate('/worker/registration')}
          >
            <Icon name="shield" size={13} /> Complete KYC
          </button>
        </div>
      )}

      <div className="worker-dashboard">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">{title}</h1>
            <p className="dash-subtitle">{subtitle}</p>
          </div>
          {activeNav === 'dashboard' && (
            <div className="dash-header-actions">
              <Link to="/claim" className="btn-secondary btn-with-icon"><Icon name="send" size={15} /> File a Claim</Link>
              <Link to="/buy-policy" className="btn-primary btn-with-icon"><Icon name="zap" size={15} /> Upgrade Plan</Link>
            </div>
          )}
        </div>
        <ActiveSection />
      </div>
    </DashboardLayout>
  )
}

