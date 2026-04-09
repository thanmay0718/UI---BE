import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Icon } from '../components/Icons'
import api from '../services/api'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts'
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
  const [realStats, setRealStats] = useState({ payments: [], claims: [], weatherRisk: null, aqiRisk: null, newsRisk: null, riskHistory: [] })

  useEffect(() => {
    async function loadDash() {
      try {
        const pRes = await api.get('/auth/profile').catch(() => ({ data: null }))
        if (pRes.data && pRes.data.id) {
           const profileData = JSON.parse(localStorage.getItem('gigshield_profile')) || {};
           const workerRes = await api.get(`/api/v1/workers`).catch(()=>({data:[]}))
           const myWorker = Array.isArray(workerRes.data) ? workerRes.data.find(w => w.userId === pRes.data.id || w.email === pRes.data.email) : null;
           const targetWorkerId = pRes.data.id;
           
           const cityTarget = myWorker?.workingCity || profileData.workingCity || 'New York';
           
           const [payRes, claimsRes, weatherRes, aqiRes, histRes, newsRes] = await Promise.all([
             api.get(`/api/v1/payments/worker/${targetWorkerId}`).catch(()=>({data:[]})),
             api.get('/api/v1/claims').catch(()=>({data:[]})),
             api.get(`/api/v1/risk/weather?city=${encodeURIComponent(cityTarget)}`).catch(()=>({data:null})),
             api.get(`/api/v1/risk/aqi?city=${encodeURIComponent(cityTarget)}`).catch(()=>({data:null})),
             api.get(`/api/v1/risk/history?workerId=${targetWorkerId}`).catch(()=>({data:[]})),
             api.get(`/api/v1/risk/news?city=${encodeURIComponent(cityTarget)}`).catch(()=>({data:null}))
           ])
           setRealStats({ 
             myWorker,
             payments: payRes.data, 
             claims: claimsRes.data.filter(c => c.workerId === targetWorkerId),
             weatherRisk: weatherRes.data,
             aqiRisk: aqiRes.data,
             newsRisk: newsRes.data,
             riskHistory: histRes.data
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

  const recentPayments = realStats.payments?.slice(0, 3) || []
  const weatherRiskRaw = realStats.weatherRisk?.riskMultiplier || 1.0;
  const weatherScore = Math.min(100, Math.round(realStats.weatherRisk?.weatherScore || 0));
  const aqiScore = realStats.aqiRisk?.aqiScore || 0;

  const historyData = realStats.riskHistory.length > 0 ? realStats.riskHistory.slice(-12).map(h => ({
     name: new Date(h.recordedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}),
     score: Math.round((h.overallScore || h.weatherScore || 0))
  })) : [];


  const COLORS = ['#FF7A00', '#2E2D2B', '#E5E2E1'];
  
  const radarData = [
    { subject: 'Precipitation', A: Math.min(100, (realStats.weatherRisk?.triggerValue || 0) * 5), fullMark: 100 },
    { subject: 'Air Quality (AQI)', A: aqiScore, fullMark: 100 },
    { subject: 'Traffic Delay', A: (weatherRiskRaw > 1.2 ? 80 : 35), fullMark: 100 },
    { subject: 'Payout Likelihood', A: (weatherScore * 0.7 + aqiScore * 0.3), fullMark: 100 },
    { subject: 'Zone Hazard', A: Math.min(100, Math.max(weatherScore, aqiScore) * 1.2), fullMark: 100 },
  ];


  const profileData = JSON.parse(localStorage.getItem('gigshield_profile')) || {};
  const city = realStats.myWorker?.workingCity || profileData.workingCity || 'New York';
  const area = realStats.myWorker?.workingZone || profileData.workingZone || 'Downtown';

  return (
    <div className="section-content">
      <div className="dashboard-title-row">
         <div className="dashboard-title-text">
            <p className="section-eyebrow">Risk Analytics</p>
            <h1>{city}, <span style={{color: 'var(--primary)'}}>{area}</span></h1>
         </div>
         <div className="dashboard-location-badge">
            <Icon name="location_on" size={18} /> Live Sentinel Active
         </div>
      </div>

      {/* Real-time AI Risk Intelligence Overview */}
      <div className="pie-chart-container" style={{position: 'relative'}}>
         <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.15, pointerEvents: 'none'}}>
            {weatherRiskRaw > 1.2 && <div className="anim-rain-container">
               <div className="anim-drop" style={{left: '10%'}}></div><div className="anim-drop" style={{left: '30%', animationDelay: '0.2s'}}></div>
               <div className="anim-drop" style={{left: '70%', animationDelay: '0.1s'}}></div><div className="anim-drop" style={{left: '90%', animationDelay: '0.5s'}}></div>
            </div>}
         </div>
         <div style={{ width: '100%', height: '350px', background: 'radial-gradient(circle, rgba(255,122,0,0.05) 0%, transparent 70%)', borderRadius: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="var(--outline)" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--on-surface-variant)', fontSize: 13, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Risk Analysis" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                <RechartsTooltip contentStyle={{background: 'var(--surface-container-high)', border: '1px solid var(--primary)', borderRadius: '8px', color: 'var(--on-surface)'}} />
              </RadarChart>
            </ResponsiveContainer>
         </div>
      </div>
      
      <div className="worker-metrics" style={{marginTop: '1rem'}}>
        <div className="metric-card card apple-glass" style={{ border: '1px solid rgba(255, 122, 0, 0.2)' }}>
          <div className="metric-card-header">
            <span className="metric-icon-wrap"><Icon name="cloud" size={22} color="var(--primary)" /></span>
            <span className="badge badge-warning">AI Model Active</span>
          </div>
          <h3 className="metric-card-title">Real-Time Weather Risk</h3>
          <p className="metric-card-desc">Live parametric tracking powered by GigShield AI Core.</p>
          <div className="metric-grid">
            <div className="metric-item"><span className="metric-label">Precipitation</span><span className="metric-value">{(realStats.weatherRisk?.triggerValue || 0).toFixed(1)} mm</span></div>
            <div className="metric-item"><span className="metric-label">Risk Mult</span><span className="metric-value gradient-text">{(realStats.weatherRisk?.riskMultiplier || 1.0).toFixed(2)}x</span></div>
            <div className="metric-item"><span className="metric-label">Threshold</span><span className="metric-value">{realStats.weatherRisk?.threshold || 10} mm</span></div>
            <div className="metric-item"><span className="metric-label">Condition</span><span className="metric-value">{realStats.weatherRisk?.condition || '—'}</span></div>
          </div>
        </div>

        <div className="stat-cards-col">
          <div className="stat-mini card">
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
               <div>
                  <span className="stat-mini-label">Air Quality Risk (AQI)</span>
                  <span className="stat-mini-value" style={{ color: aqiScore > 70 ? 'var(--error)' : 'var(--tertiary)' }}>{aqiScore}</span>
               </div>
               <span style={{opacity: 0.2}}><Icon name="cloud" size={32} /></span>
             </div>
             <span className="stat-mini-sub">{aqiScore > 70 ? 'Hazardous Conditions Detected' : 'Normal Conditions'}</span>
          </div>
          <div className="stat-mini card">
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
               <div>
                 <span className="stat-mini-label">Next Payout Potential</span>
                 <span className="stat-mini-value gradient-text">₹{(weatherRiskRaw > 1.0 ? 250 : 0).toFixed(2)}</span>
               </div>
               <span style={{opacity: 0.2}}><Icon name="payments" size={32} /></span>
             </div>
             <span className="stat-mini-sub">{weatherRiskRaw > 1.2 ? 'Trigger conditions heavily met' : `${realStats.weatherRisk?.condition || 'Clear'} — conditions not met`}</span>
          </div>
        </div>
      </div>
      <div className="activity-card card" style={{marginTop: '1rem'}}>
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

      <div className="card" style={{marginTop: '1rem', padding: '1.5rem'}}>
         <h3 style={{marginBottom: '1rem'}}>Active Risks in {city} <span className="badge badge-error">LIVE</span></h3>
         <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            {realStats.newsRisk?.articles && realStats.newsRisk.articles.slice(0, 3).map((article, i) => (
              <div key={i} style={{padding: '0.75rem', border: '1px solid rgba(255,122,0,0.2)', borderRadius: '8px', background: 'var(--surface-container-high)'}}>
                <h4 style={{fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--on-surface)'}}>{article.title}</h4>
                <p style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)', margin: 0}}>{article.description}</p>
                <div style={{fontSize: '0.7rem', color: 'var(--primary)', marginTop: '0.5rem'}}>{new Date(article.publishedAt).toLocaleString()}</div>
              </div>
            ))}
            {(!realStats.newsRisk || !realStats.newsRisk.articles || realStats.newsRisk.articles.length === 0) && (
              <p style={{color: 'var(--on-surface-variant)', fontSize: '0.875rem'}}>No major disruptions or social risks reported in your area currently.</p>
            )}
         </div>
      </div>
    </div>
  )
}

function RiskHistoryView() {
  const [loading, setLoading] = useState(true)
  const [historyData, setHistoryData] = useState([])
  const [searchDate, setSearchDate] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL') // ALL | Safe | Monitor | Payout

  useEffect(() => {
    async function fetchHistory() {
      try {
        const pRes = await api.get('/auth/profile').catch(() => ({ data: null }))
        if (pRes.data && pRes.data.id) {
           const wRes = await api.get('/api/v1/workers').catch(() => ({ data: [] }))
           const myWorker = wRes.data.find(w => w.email === pRes.data.email)
           const targetWorkerId = pRes.data.id;
           const histRes = await api.get(`/api/v1/risk/history?workerId=${targetWorkerId}&range=ALL`).catch(()=>({data:[]}))
           const data = Array.isArray(histRes.data) ? histRes.data : []
           const mapped = data.map(h => ({
             name: new Date(h.recordedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}),
             score: Math.round(h.overallScore || h.weatherScore || 0),
             rawDate: h.recordedAt,
             weatherScore: Math.round(h.weatherScore || 0),
             aqiScore: Math.round(h.aqiScore || 0)
           }))
           setHistoryData(mapped)
        }
      } catch (err) {
        console.error('History fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  // Apply filters
  const filteredData = historyData.filter(d => {
    // Text search
    if (searchDate && !d.name.toLowerCase().includes(searchDate.toLowerCase())) return false
    // Date range from
    if (filterFrom && new Date(d.rawDate) < new Date(filterFrom)) return false
    // Date range to
    if (filterTo && new Date(d.rawDate) > new Date(filterTo + 'T23:59:59')) return false
    // Status filter
    if (filterStatus === 'Safe' && d.score >= 50) return false
    if (filterStatus === 'Monitor' && (d.score < 50 || d.score >= 80)) return false
    if (filterStatus === 'Payout' && d.score < 80) return false
    return true
  })

  const clearFilters = () => {
    setSearchDate('')
    setFilterFrom('')
    setFilterTo('')
    setFilterStatus('ALL')
  }

  const hasActiveFilters = searchDate || filterFrom || filterTo || filterStatus !== 'ALL'

  return (
    <div className="section-content">
      <div className="section-top-row">
        <div><h2 className="section-h2">Risk History Analysis</h2><p className="section-sub">Historical breakdown of real-time AI risk assessments since your registration.</p></div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end'}}>
        {/* Calendar text search */}
        <div style={{flex: 1, minWidth: '180px'}}>
          <label style={{fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.4rem'}}>Search Date</label>
          <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
            <Icon name="search" size={14} color="var(--on-surface-variant)" style={{position: 'absolute', left: '0.75rem'}} />
            <input
              className="form-input"
              placeholder="e.g. Mar 12"
              value={searchDate}
              onChange={e => setSearchDate(e.target.value)}
              style={{paddingLeft: '2.25rem'}}
            />
          </div>
        </div>

        {/* From Calendar */}
        <div style={{minWidth: '160px'}}>
          <label style={{fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.4rem'}}>From</label>
          <input
            type="date"
            className="form-input"
            value={filterFrom}
            onChange={e => setFilterFrom(e.target.value)}
            style={{colorScheme: 'dark'}}
          />
        </div>

        {/* To Calendar */}
        <div style={{minWidth: '160px'}}>
          <label style={{fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.4rem'}}>To</label>
          <input
            type="date"
            className="form-input"
            value={filterTo}
            onChange={e => setFilterTo(e.target.value)}
            style={{colorScheme: 'dark'}}
          />
        </div>

        {/* Status Filter */}
        <div style={{minWidth: '140px'}}>
          <label style={{fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.4rem'}}>Status</label>
          <select className="form-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{colorScheme: 'dark'}}>
            <option value="ALL">All Statuses</option>
            <option value="Safe">Safe (0–49)</option>
            <option value="Monitor">Monitor (50–79)</option>
            <option value="Payout">Payout Eligible (80+)</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button className="btn-secondary btn-sm btn-with-icon" onClick={clearFilters} style={{alignSelf: 'flex-end', height: '40px'}}>
            <Icon name="close" size={13} /> Clear Filters
          </button>
        )}

        <div style={{alignSelf: 'flex-end', marginLeft: 'auto'}}>
          <span className="badge badge-info" style={{padding: '0.5rem 0.75rem'}}>
            {filteredData.length} record{filteredData.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      <div className="card" style={{padding: '1.5rem', marginBottom: '1.5rem'}}>
          <div className="chart-header">
            <h3>Parametric Risk Timeline</h3>
            <span style={{fontSize:'0.8rem', color:'var(--on-surface-variant)'}}>{filteredData.length} data points</span>
          </div>
          {filteredData.length === 0 && !loading ? (
            <div style={{textAlign:'center', padding:'3rem', color:'var(--on-surface-variant)'}}>
              <Icon name="history" size={40} color="rgba(255,122,0,0.3)" />
              <p style={{marginTop:'1rem'}}>No risk data yet. Data is captured daily once your Working Area is configured.</p>
            </div>
          ) : (
          <div style={{ height: '300px', width: '100%', marginTop: '1.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{fill: 'var(--on-surface-variant)', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: 'var(--on-surface-variant)', fontSize: 12}} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{fill: 'rgba(255, 122, 0, 0.1)'}} 
                  contentStyle={{background: 'var(--surface-container-high)', border: '1px solid var(--primary)', borderRadius: '8px', color: 'var(--on-surface)'}} 
                />
                <Bar dataKey="score" fill="var(--primary)" radius={[4, 4, 0, 0]}>
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score > 80 ? 'var(--error)' : 'url(#colorGradient)'} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}
      </div>
      
      <div className="card table-card">
         <h3 style={{padding: '1.5rem', margin: 0}}>Daily Risk Ledger</h3>
         <table className="worker-table">
          <thead><tr><th>Date Evaluated</th><th>Zone</th><th>Weather Risk</th><th>AQI Risk</th><th>Combined Score</th><th>Status</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>Loading historical telemetry...</td></tr> :
             filteredData.length === 0 ? <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem', color:'var(--on-surface-variant)'}}>No records found. Try adjusting your filters.</td></tr> :
             [...filteredData].reverse().map((h, i) => (
              <tr key={i}>
                <td className="date-cell" style={{fontWeight: 600}}>{h.name}</td>
                <td><span className="badge badge-info">Profile Zone</span></td>
                <td><span style={{fontSize:'0.875rem', fontWeight:600, color: h.weatherScore > 50 ? 'var(--error)' : 'var(--primary)'}}>{h.weatherScore ?? '—'}</span></td>
                <td><span style={{fontSize:'0.875rem', fontWeight:600, color: h.aqiScore > 50 ? 'var(--tertiary)' : 'var(--on-surface-variant)'}}>{h.aqiScore ?? '—'}</span></td>
                <td style={{fontWeight: 700, color: h.score > 80 ? 'var(--error)' : 'var(--primary)'}}>{h.score}/100</td>
                <td><span className={`badge ${h.score > 80 ? 'badge-error' : h.score > 50 ? 'badge-warning' : 'badge-active'}`}>{h.score > 80 ? 'Payout Eligible' : h.score > 50 ? 'Monitor' : 'Safe'}</span></td>
              </tr>
            ))}
          </tbody>
         </table>
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
           const wRes = await api.get('/api/v1/workers').catch(() => ({ data: [] }))
           const myWorker = wRes.data.find(w => w.email === pRes.data.email)
           const targetWorkerId = pRes.data.id;
           const res = await api.get(`/api/v1/policies?workerId=${targetWorkerId}`)
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

/* ——————————————————— ENHANCED CLAIMS VIEW ——————————————————— */

function ClaimsView() {
  const navigate = useNavigate()
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWorkerClaims() {
      try {
        const pRes = await api.get('/auth/profile').catch(() => ({ data: null }))
        if (pRes.data && pRes.data.id) {
           const targetWorkerId = pRes.data.id
           const res = await api.get('/api/v1/claims')
           setClaims(res.data.filter(c => c.workerId === targetWorkerId).slice(0, 10))
        }
      } catch (err) {
        console.error('Failed loading claims', err)
      } finally {
        setLoading(false)
      }
    }
    loadWorkerClaims()
  }, [])

  const decisionBadge = (d) =>
    d === 'AUTO_APPROVED' ? 'badge-active' :
    d === 'AUTO_REJECTED' ? 'badge-error' :
    d === 'MANUAL_REVIEW' ? 'badge-warning' : 'badge-info'

  return (
    <div className="section-content">
      <div className="section-top-row">
        <div>
          <h2 className="section-h2">Claims History</h2>
          <p className="section-sub">All your past and active claims — including AI decision scores and payout amounts.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary btn-with-icon" onClick={() => navigate('/worker/claims')}>
            <Icon name="activity" size={15} /> View All
          </button>
          <Link to="/claim" className="btn-primary btn-with-icon"><Icon name="plus" size={16} /> File Claim</Link>
        </div>
      </div>
      <div className="card table-card" style={{ overflowX: 'auto' }}>
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Loading claims ledger...</div> : (
        <table className="worker-table" style={{ minWidth: '820px' }}>
          <thead><tr>
            <th>Claim ID</th><th>Policy</th><th>Type</th>
            <th>Risk Score</th><th>Fraud Score</th><th>AI Decision</th>
            <th>Payout</th><th>Status</th><th>Date</th>
          </tr></thead>
          <tbody>
            {claims.map(c => (
              <tr key={c.id}>
                <td className="claim-id-cell">C-{c.id}</td>
                <td>P-{c.policyId}</td>
                <td><span className="badge badge-info">{c.disruptionType || 'MANUAL'}</span></td>
                <td>
                  {c.riskScore != null
                    ? <span style={{ fontWeight: 700, color: c.riskScore > 70 ? 'var(--error)' : c.riskScore > 40 ? 'var(--primary)' : 'var(--tertiary)' }}>{Number(c.riskScore).toFixed(1)}</span>
                    : <span style={{ color: 'var(--on-surface-variant)' }}>—</span>}
                </td>
                <td>
                  {c.fraudScore != null
                    ? <span style={{ fontWeight: 700, color: c.fraudScore > 60 ? 'var(--error)' : c.fraudScore > 30 ? 'var(--primary)' : 'var(--tertiary)' }}>{Number(c.fraudScore).toFixed(1)}</span>
                    : <span style={{ color: 'var(--on-surface-variant)' }}>—</span>}
                </td>
                <td>
                  {c.decision
                    ? <span className={`badge ${decisionBadge(c.decision)}`}>{c.decision.replace(/_/g, ' ')}</span>
                    : <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>Pending AI</span>}
                </td>
                <td style={{ fontWeight: 700, color: c.approvedAmount ? 'var(--tertiary)' : 'var(--on-surface-variant)' }}>
                  {c.approvedAmount ? `₹${Number(c.approvedAmount).toFixed(2)}` : c.amount ? `₹${c.amount}` : '—'}
                </td>
                <td><span className={`badge ${c.status === 'APPROVED' ? 'badge-active' : c.status === 'FLAGGED' || c.status === 'FLAGGED_FOR_REVIEW' ? 'badge-error' : 'badge-warning'}`}>{c.status}</span></td>
                <td className="date-cell">{c.claimDate ? new Date(c.claimDate).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
            {claims.length === 0 && (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-surface-variant)' }}>
                No claims filed yet. <Link to="/claim" style={{ color: 'var(--primary)' }}>File your first claim →</Link>
              </td></tr>
            )}
          </tbody>
        </table>
        )}
        {!loading && claims.length > 0 && (
          <div style={{ textAlign: 'center', padding: '1rem', borderTop: '1px solid rgba(88,66,53,0.15)' }}>
            <button className="btn-secondary btn-sm btn-with-icon" onClick={() => navigate('/worker/claims')}>
              <Icon name="arrow_down" size={13} /> View Full Claims History
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
           const wRes = await api.get('/api/v1/workers').catch(() => ({ data: [] }))
           const myWorker = wRes.data.find(w => w.email === pRes.data.email)
           const targetWorkerId = pRes.data.id;
           const res = await api.get(`/api/v1/payments/worker/${targetWorkerId}`)
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
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [workerId, setWorkerId] = useState(null);

  // Persistent Profile Logic
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('gigshield_profile');
    return saved ? JSON.parse(saved) : { name: 'Alex Rivera', email: 'alex.rivera@gigshield.ai', phone: '+1 (555) 012-3456', location: 'New York, NY 10001' };
  });
  
  const [photo, setPhoto] = useState(null);
  const [userId, setUserId] = useState(null);
  
  const [platforms, setPlatforms] = useState(() => {
    const saved = localStorage.getItem('gigshield_platforms');
    return saved ? JSON.parse(saved) : ['Uber', 'DoorDash', 'Lyft'];
  });
  
  const [workingArea, setWorkingArea] = useState(() => {
    const saved = localStorage.getItem('gigshield_profile');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      workingCity: parsed.workingCity || 'New York',
      workingZone: parsed.workingZone || 'Manhattan', // Used as Area
      activePlatforms: parsed.activePlatforms || 'Uber, DoorDash',
      workingHoursStart: parsed.workingHoursStart || '09:00',
      workingHoursEnd: parsed.workingHoursEnd || '17:00'
    };
  });

  const [modalConfig, setModalConfig] = useState(null);
  const [newPlatform, setNewPlatform] = useState('');
  const navigate = useNavigate()

  useEffect(() => {
    async function loadWorkerProfile() {
      try {
        const pRes = await api.get('/auth/profile').catch(() => ({ data: null }))
        if (pRes.data && pRes.data.id) {
           const idStr = String(pRes.data.id);
           setUserId(idStr);
           setPhoto(localStorage.getItem(`gigshield_photo_${idStr}`));
           
           setForm(prev => ({
             ...prev,
             name: pRes.data.username || prev.name,
             email: pRes.data.email || prev.email
           }))
           const wRes = await api.get('/api/v1/workers').catch(() => ({ data: [] }))
           const myWorker = wRes.data.find(w => w.email === pRes.data.email)
           if (myWorker) {
             setWorkerId(myWorker.id);
             setForm(prev => ({
               ...prev,
               name: pRes.data.username || prev.name,
               email: pRes.data.email || prev.email,
               phone: myWorker.phone || prev.phone,
               location: myWorker.address || prev.location
             }))
             setWorkingArea(prev => ({
               workingCity: myWorker.workingCity || prev.workingCity,
               workingZone: myWorker.workingZone || prev.workingZone,
               activePlatforms: myWorker.activePlatforms || prev.activePlatforms,
               workingHoursStart: myWorker.workingHours ? myWorker.workingHours.split(' - ')[0] : prev.workingHoursStart,
               workingHoursEnd: myWorker.workingHours ? myWorker.workingHours.split(' - ')[1] : prev.workingHoursEnd
             }))
             if (myWorker.activePlatforms) {
               setPlatforms(myWorker.activePlatforms.split(',').map(s => s.trim()).filter(Boolean))
               localStorage.setItem('gigshield_platforms', JSON.stringify(myWorker.activePlatforms.split(',').map(s=>s.trim()).filter(Boolean)))
             }
           }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      } finally {
        setLoadingConfig(false)
      }
    }
    loadWorkerProfile()
  }, [])

  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setWA = k => e => setWorkingArea(f => ({ ...f, [k]: e.target.value }))

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        
        // Compress using Canvas to prevent localStorage QuotaExceeded
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 400; // max width/height

          if (width > height) {
            if (width > maxDim) { height *= maxDim / width; width = maxDim; }
          } else {
            if (height > maxDim) { width *= maxDim / height; height = maxDim; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setPhoto(compressedBase64);
          
          const targetId = userId || 'default';
          try {
            localStorage.setItem(`gigshield_photo_${targetId}`, compressedBase64);
            window.dispatchEvent(new Event('photo_updated'));
          } catch(err) {
            console.error('Storage full, failed to save photo natively', err);
          }
        };
        img.src = base64;
      };
      reader.readAsDataURL(file);
    }
  }

  const toggleEdit = async () => {
    if (editing) {
      const combinedForm = { ...form, workingCity: workingArea.workingCity, workingZone: workingArea.workingZone, area: workingArea.workingZone };
      localStorage.setItem('gigshield_profile', JSON.stringify(combinedForm));
      // Save working area to backend
      if (workerId) {
         try {
            await api.put(`/api/v1/worker/profile/working-area?workerId=${workerId}`, {
               workingCity: workingArea.workingCity,
               workingZone: workingArea.workingZone,
               activePlatforms: platforms,
               workingHours: `${workingArea.workingHoursStart} - ${workingArea.workingHoursEnd}`
            });
         } catch(err) {
            console.error(err);
         }
      }
      setModalConfig({ type: 'info', title: 'Profile Secured', message: 'Your profile and Working Area configurations have been securely updated.' });
    }
    setEditing(!editing)
  }

  const linkPlatform = (name) => {
    if (!platforms.includes(name)) {
      const newList = [...platforms, name];
      setPlatforms(newList);
      localStorage.setItem('gigshield_platforms', JSON.stringify(newList));
      setWorkingArea(w => ({ ...w, activePlatforms: newList.join(', ') }));
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
        <div><h2 className="section-h2">My Profile &amp; Working Area</h2><p className="section-sub">Manage your account details, location configuration, and linked platforms.</p></div>
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
            <div><span>Primary City</span><strong>{workingArea.workingCity}</strong></div>
            <div><span>Risk Score</span><strong style={{ color: 'var(--tertiary)' }}>Low (82)</strong></div>
            <div><span>Platforms Active</span><strong>{platforms.length}</strong></div>
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
                { label: 'Billing Address',   key: 'location', type: 'text' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label>{f.label}</label>
                  <input
                    type={f.type}
                    className="form-input"
                    value={form[f.key]}
                    onChange={setF(f.key)}
                    disabled={!editing}
                    style={{ opacity: editing ? 1 : 0.8 }}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Working Area Settings */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem', border: '1px solid rgba(255, 122, 0, 0.2)', background: 'linear-gradient(135deg, rgba(255,122,0,0.05), rgba(0,0,0,0))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
               <Icon name="cloud" size={18} color="var(--primary)" />
               <h4 className="card-section-title" style={{marginBottom: 0}}>Working Area Configuration</h4>
            </div>
            
            <p style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '1rem'}}>
               Define your operational zone to enable precise real-time AI parametric triggers for weather and external disruptions.
            </p>
            {loadingConfig ? <p>Loading data...</p> : (
            <div className="profile-form-grid">
              {[
                { label: 'Operational City',  key: 'workingCity',     type: 'text' },
                { label: 'Area / Zone',      key: 'workingZone',    type: 'text' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label>{f.label}</label>
                  <input
                    type={f.type}
                    className="form-input"
                    value={workingArea[f.key] || ''}
                    onChange={setWA(f.key)}
                    disabled={!editing}
                    style={{ opacity: editing ? 1 : 0.8 }}
                  />
                </div>
              ))}
              <div className="form-group">
                <label>Working Hours</label>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <select 
                    className="form-input" 
                    value={workingArea.workingHoursStart} 
                    onChange={setWA('workingHoursStart')} 
                    disabled={!editing}
                    style={{ opacity: editing ? 1 : 0.8 }}
                  >
                    {[...Array(24)].map((_, i) => <option key={`s${i}`} value={`${i.toString().padStart(2, '0')}:00`}>{`${(i%12)||12}:00 ${i<12?'AM':'PM'}`}</option>)}
                  </select>
                  <span style={{alignSelf: 'center', color: 'var(--on-surface-variant)'}}>to</span>
                  <select 
                    className="form-input" 
                    value={workingArea.workingHoursEnd} 
                    onChange={setWA('workingHoursEnd')} 
                    disabled={!editing}
                    style={{ opacity: editing ? 1 : 0.8 }}
                  >
                    {[...Array(24)].map((_, i) => <option key={`e${i}`} value={`${i.toString().padStart(2, '0')}:00`}>{`${(i%12)||12}:00 ${i<12?'AM':'PM'}`}</option>)}
                  </select>
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Connected platforms */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 className="card-section-title">Active Platforms</h4>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem'}}>
               {platforms.map(pl => (
                 <span key={pl} className="badge badge-active" style={{padding: '0.5rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                   {pl}
                   {editing && <button onClick={() => {
                      const next = platforms.filter(p => p !== pl);
                      setPlatforms(next);
                      localStorage.setItem('gigshield_platforms', JSON.stringify(next));
                      setWorkingArea(w => ({ ...w, activePlatforms: next.join(', ') }));
                    }} style={{background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', color: 'inherit'}}>✕</button>}
                 </span>
               ))}
               {platforms.length === 0 && <span style={{color: 'var(--on-surface-variant)', fontSize: '0.875rem'}}>No platforms configured.</span>}
            </div>
            
            {editing && (
              <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid rgba(255,122,0,0.2)', paddingTop: '1rem'}}>
                <select 
                  className="form-input" 
                  value={newPlatform} 
                  onChange={e => setNewPlatform(e.target.value)} 
                  style={{flex: 1}}
                >
                  <option value="">Select a trending platform...</option>
                  <option value="Uber">Uber</option>
                  <option value="OLA">OLA</option>
                  <option value="Rapido">Rapido</option>
                  <option value="Swiggy">Swiggy</option>
                  <option value="Zomato">Zomato</option>
                  <option value="Blinkit">Blinkit</option>
                  <option value="Zepto">Zepto</option>
                  <option value="Dunzo">Dunzo</option>
                  <option value="Shadowfax">Shadowfax</option>
                  <option value="Porter">Porter</option>
                </select>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    if (newPlatform.trim() && !platforms.includes(newPlatform.trim())) {
                      linkPlatform(newPlatform.trim());
                      setNewPlatform('');
                    }
                  }}
                >Add Platform</button>
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
    return saved ? JSON.parse(saved) : { name: 'Loading...', display: 'Worker', email: 'loading@gigshield.ai' };
  })
  
  useEffect(() => {
    async function loadSecureProfile() {
      const pRes = await api.get('/auth/profile').catch(() => ({ data: null }))
      if (pRes.data && pRes.data.id) {
         setProfile(p => ({
            ...p,
            name: pRes.data.username || p.name,
            email: pRes.data.email || p.email,
            display: pRes.data.username ? pRes.data.username.split(' ')[0] + '_Delivery' : p.display
         }));
      }
    }
    loadSecureProfile();
  }, [])
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

/* ——————————————————— AI SHIELD VIEW ——————————————————— */
function AIShieldView() {
  const [loading, setLoading] = useState(true)
  const [riskData, setRiskData] = useState(null)
  const [myClaims, setMyClaims] = useState([])
  const [simLoading, setSimLoading] = useState(false)
  const [simResult, setSimResult] = useState(null)
  const [simError, setSimError] = useState('')
  const [workerId, setWorkerId] = useState(null)
  const [policyId, setPolicyId] = useState(null)
  const [city, setCity] = useState('')

  useEffect(() => {
    async function loadAIShield() {
      try {
        const pRes = await api.get('/auth/profile').catch(() => ({ data: null }))
        if (!pRes?.data?.id) return
        const authUid = pRes.data.id

        const [wRes, claimsRes] = await Promise.all([
          api.get('/api/v1/workers').catch(() => ({ data: [] })),
          api.get('/api/v1/claims').catch(() => ({ data: [] }))
        ])
        const myWorker = wRes.data.find(w => w.email === pRes.data.email)

        // ✅ Use Worker DB id (not auth user id) — AIOrchestrationService looks up Worker table
        const workerDbId = myWorker?.id || authUid
        setWorkerId(workerDbId)

        const cityTarget = myWorker?.workingCity || 'Mumbai'
        setCity(cityTarget)

        // auto-get first active policy
        const policyRes = await api.get(`/api/v1/policies?workerId=${authUid}`).catch(() => ({ data: [] }))
        const activePol = Array.isArray(policyRes.data) ? policyRes.data.find(p => p.status === 'ACTIVE') : null
        if (activePol) setPolicyId(activePol.id)

        // get risk score using worker db id
        const riskRes = await api.get(`/api/ai/risk-score?city=${encodeURIComponent(cityTarget)}&workerId=${workerDbId}&zone=URBAN`).catch(() => ({ data: null }))
        setRiskData(riskRes.data)

        // get personal AI claims — filter by worker db id
        const aiClaimsAll = await api.get('/api/ai/audit/claims').catch(() => ({ data: [] }))
        const mineArr = Array.isArray(aiClaimsAll.data)
          ? aiClaimsAll.data.filter(c => String(c.workerId) === String(workerDbId))
          : []
        // also attach any standard claims without AI fields
        const stdClaims = Array.isArray(claimsRes.data)
          ? claimsRes.data.filter(c => c.workerId === authUid && c.decision)
          : []
        setMyClaims(mineArr.length > 0 ? mineArr : stdClaims.slice(0, 5))
      } catch (err) {
        console.error('AI Shield load error', err)
      } finally {
        setLoading(false)
      }
    }
    loadAIShield()
  }, [])

  const handleSimulate = async () => {
    if (!workerId || !policyId) {
      setSimError('No active policy found. Please buy a policy first, or ensure your policy status is ACTIVE.')
      return
    }
    setSimError('')
    setSimLoading(true)
    setSimResult(null)
    try {
      const res = await api.get(`/api/ai/demo/simulate-rain?workerId=${workerId}&policyId=${policyId}&city=${encodeURIComponent(city || 'Mumbai')}`)
      setSimResult(res.data)
    } catch (err) {
      setSimError(err.response?.data?.message || 'Simulation failed. Ensure your Worker ID and Policy ID are valid and the policy is ACTIVE.')
    } finally {
      setSimLoading(false)
    }
  }

  const breakdown = riskData?.breakdown
  const totalScore = breakdown?.totalScore ?? 0
  const riskLevel = breakdown?.riskLevel ?? 'UNKNOWN'
  const riskColor = riskLevel === 'HIGH' ? 'var(--error)' : riskLevel === 'MODERATE' ? 'var(--primary)' : 'var(--tertiary)'
  const decisionBadge = (d) => d === 'AUTO_APPROVED' ? 'badge-active' : d === 'AUTO_REJECTED' ? 'badge-error' : 'badge-warning'

  return (
    <div className="section-content">
      { /* Hero Risk Score Card */ }
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'stretch' }}>
        {/* Big score ring */}
        <div className="card apple-glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '200px', border: `1px solid ${riskColor}33` }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>Your Risk Score</p>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <circle cx="60" cy="60" r="50" fill="none" stroke={riskColor} strokeWidth="10"
                strokeDasharray={`${loading ? 0 : (totalScore / 100) * 314} 314`}
                strokeLinecap="round" style={{ transition: 'stroke-dasharray 1.2s ease' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: riskColor }}>{loading ? '...' : Math.round(totalScore)}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>/100</span>
            </div>
          </div>
          <span className="badge" style={{ marginTop: '1rem', background: `${riskColor}22`, color: riskColor }}>{loading ? 'Loading...' : riskLevel}</span>
          <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', marginTop: '0.75rem', textAlign: 'center' }}>{riskData?.city || city}</p>
        </div>

        {/* Breakdown grid */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3>Real-Time Risk Breakdown</h3>
            <span className="badge badge-active">Live Engine</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.875rem' }}>
            {loading ? Array(5).fill(0).map((_,i) => (
              <div key={i} style={{ padding: '0.875rem', background: 'var(--surface-container)', borderRadius: '10px', opacity: 0.4, height: '80px' }} />
            )) : [
              { label: 'Weather', value: breakdown?.weatherScore ?? 0, icon: 'cloud' },
              { label: 'AQI',     value: breakdown?.aqiScore ?? 0,     icon: 'cloud' },
              { label: 'Zone',    value: breakdown?.zoneScore ?? 0,    icon: 'location_on' },
              { label: 'History', value: breakdown?.historyScore ?? 0, icon: 'history' },
              { label: 'Social',  value: breakdown?.socialScore ?? 0,  icon: 'people' },
            ].map(f => {
              const pct = Math.min(100, f.value)
              const col = pct > 70 ? 'var(--error)' : pct > 40 ? 'var(--primary)' : 'var(--tertiary)'
              return (
                <div key={f.label} style={{ padding: '0.875rem', background: 'var(--surface-container)', borderRadius: '10px', border: `1px solid ${col}22` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>{f.label}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: col }}>{pct.toFixed(0)}</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: '2px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '1rem' }}>
            Recommendation: <strong style={{ color: riskData?.recommendation === 'TRIGGER_ELIGIBLE' ? 'var(--tertiary)' : 'var(--on-surface)' }}>{riskData?.recommendation ?? 'Fetching...'}</strong>
          </p>
        </div>
      </div>

      {/* Payout Simulator */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem', border: '1px solid rgba(255,122,0,0.2)', background: 'rgba(255,122,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h3>🌧 Instant Payout Simulator</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>Simulate how GigShield AI would process a heavy rain claim for you — see your risk score, fraud check, and exact payout in real time.</p>
          </div>
          {policyId && <span className="badge badge-active" style={{ flexShrink: 0 }}>Policy #{policyId} Active</span>}
        </div>
        <button
          className="btn-primary btn-with-icon"
          onClick={handleSimulate}
          disabled={simLoading || !policyId}
          style={{ justifyContent: 'center', padding: '0.875rem 2rem', fontSize: '0.95rem', background: 'linear-gradient(135deg, var(--primary), #ffa34d)', boxShadow: '0 4px 20px rgba(255,122,0,0.3)', opacity: (!policyId || simLoading) ? 0.65 : 1 }}
        >
          <Icon name="zap" size={18} />
          {simLoading ? 'AI Processing Your Claim...' : !policyId ? 'No Active Policy Found' : `⚡ Simulate Rain Claim for ${city || 'your city'}`}
        </button>
        {simError && <p style={{ color: 'var(--error)', marginTop: '0.75rem', fontSize: '0.85rem' }}>⚠ {simError}</p>}
        {simResult && (
          <div style={{ marginTop: '1.25rem', padding: '1.5rem', background: 'var(--surface-container)', borderRadius: '14px', border: '1px solid rgba(74,225,131,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(74,225,131,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={18} color="var(--tertiary)" />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--tertiary)', margin: 0, fontSize: '0.9rem' }}>AI Pipeline Complete — Claim C-{simResult.claimResult?.claimId}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', margin: 0 }}>{simResult.triggerEvent}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {[
                { label: 'Risk Score',   value: simResult.claimResult?.riskScore ?? '—', col: 'var(--primary)' },
                { label: 'Fraud Score',  value: simResult.claimResult?.fraudScore ?? '—', col: 'var(--on-surface)' },
                { label: 'AI Decision', value: simResult.claimResult?.decision?.replace(/_/g,' ') ?? '—', col: simResult.claimResult?.decision === 'AUTO_APPROVED' ? 'var(--tertiary)' : 'var(--error)' },
                { label: 'Your Payout', value: simResult.claimResult?.approvedAmount ?? '₹0.00', col: 'var(--tertiary)' },
              ].map(r => (
                <div key={r.label} style={{ padding: '1rem', background: 'var(--surface-container-high)', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', margin: '0 0 0.375rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{r.label}</p>
                  <p style={{ fontWeight: 800, fontSize: '1rem', color: r.col, margin: 0 }}>{String(r.value)}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize:'0.72rem', color:'var(--on-surface-variant)', marginTop:'1rem', fontStyle:'italic', lineHeight: 1.5 }}>{simResult.interviewLine}</p>
          </div>
        )}
      </div>

      {/* My AI-Processed Claims */}
      <div className="card table-card">
        <h3 style={{ padding: '1.25rem 1.5rem', margin: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>My AI-Processed Claims</h3>
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Loading your AI claims...</div> : (
        <table className="worker-table">
          <thead><tr><th>Claim ID</th><th>Type</th><th>Risk</th><th>Fraud</th><th>Decision</th><th>Payout</th><th>Status</th></tr></thead>
          <tbody>
            {myClaims.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign:'center', padding:'2rem', color:'var(--on-surface-variant)' }}>No AI-processed claims yet. Use the simulator above to see the full pipeline in action.</td></tr>
            ) : myClaims.map(c => (
              <tr key={c.claimId || c.id}>
                <td className="claim-id-cell">C-{c.claimId || c.id}</td>
                <td><span className="badge badge-info">{c.disruptionType || 'RAIN'}</span></td>
                <td style={{ fontWeight: 700, color: (c.riskScore||0) > 70 ? 'var(--error)' : (c.riskScore||0) > 40 ? 'var(--primary)' : 'var(--tertiary)' }}>{c.riskScore != null ? Number(c.riskScore).toFixed(1) : '—'}</td>
                <td style={{ fontWeight: 700, color: (c.fraudScore||0) > 60 ? 'var(--error)' : (c.fraudScore||0) > 30 ? 'var(--primary)' : 'var(--tertiary)' }}>{c.fraudScore != null ? Number(c.fraudScore).toFixed(1) : '—'}</td>
                <td>{c.decision ? <span className={`badge ${decisionBadge(c.decision)}`}>{c.decision.replace(/_/g,' ')}</span> : '—'}</td>
                <td style={{ fontWeight: 700, color: 'var(--tertiary)' }}>{c.approvedAmount || '₹0.00'}</td>
                <td><span className={`badge ${c.status==='APPROVED'?'badge-active':c.status==='FLAGGED_FOR_REVIEW'?'badge-error':'badge-warning'}`}>{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  )
}

/* ——————————————————— NAV CONFIG ——————————————————— */
const NAV_ITEMS = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'ai',        icon: 'zap',       label: 'AI Shield', badge: 'NEW' },
  { id: 'history',   icon: 'history',   label: 'Risk History', badge: 'LIVE' },
  { id: 'policies',  icon: 'shield',    label: 'Policies'  },
  { id: 'claims',    icon: 'file',      label: 'Claims'    },
  { id: 'earnings',  icon: 'payments',  label: 'Payment History'  },
  { id: 'profile',   icon: 'person',    label: 'Profile'   },
  { id: 'settings',  icon: 'cog',       label: 'Settings'  },
]
const SECTION_MAP = { dashboard: DashboardView, ai: AIShieldView, history: RiskHistoryView, policies: PoliciesView, claims: ClaimsView, earnings: EarningsView, profile: ProfileView, settings: SettingsView }
const TITLES = {
  dashboard: { title: 'AI Risk Analysis',   subtitle: 'Your personalized income protection overview' },
  ai:        { title: 'AI Shield Center',   subtitle: 'Your personal AI pipeline — risk score, payout simulator, and AI-processed claims' },
  history:   { title: 'Risk History',       subtitle: 'Historical breakdown of algorithmic risk assessments' },
  policies:  { title: 'My Policies',        subtitle: 'Manage and view your parametric coverage' },
  claims:    { title: 'Claims',             subtitle: 'History and status of all your claims — including AI decisions' },
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
  const [displayPhoto, setDisplayPhoto] = useState(null)

  // Load real user profile for sidebar & KYC status check
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get('/auth/profile')
        if (res.data) {
          setUserProfile(res.data)
          setDisplayPhoto(localStorage.getItem(`gigshield_photo_${res.data.id}`) || null);
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

  // Listen for photo updates across the app component tree
  useEffect(() => {
    const handlePhotoUpdate = () => {
      if (userProfile?.id) {
        setDisplayPhoto(localStorage.getItem(`gigshield_photo_${userProfile.id}`));
      }
    };
    window.addEventListener('photo_updated', handlePhotoUpdate);
    return () => window.removeEventListener('photo_updated', handlePhotoUpdate);
  }, [userProfile]);

  const { title, subtitle } = TITLES[activeNav] || TITLES.dashboard
  const ActiveSection = SECTION_MAP[activeNav] || DashboardView

  // Get display name: from localStorage profile or from backend
  const savedProfile = (() => { try { return JSON.parse(localStorage.getItem('gigshield_profile')) } catch { return null } })()
  const displayName = userProfile?.username || userProfile?.email || savedProfile?.name || 'Worker'

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

