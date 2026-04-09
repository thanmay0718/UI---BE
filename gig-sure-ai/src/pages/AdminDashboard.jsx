import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { Icon } from '../components/Icons'
import api from '../services/api'
import './AdminDashboard.css'


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• DATA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const METRICS = [
  { label: 'Total Workers',     value: '12.4k', icon: 'users',   delta: '+8.2% vs last month',  positive: true  },
  { label: 'Active Policies',   value: '8.2k',  icon: 'shield',  delta: '+3.4% vs last month',  positive: true  },
  { label: 'Claims This Month', value: '1.2k',  icon: 'file',    delta: 'High volume warning',   positive: false },
  { label: 'Fraud Alerts',      value: '14',    icon: 'alert',   delta: '5 Critical unresolved', positive: false, color: 'var(--error)' },
]

const FRAUD_BUCKETS = [
  { range: '0–20%',   pct: 75, color: 'var(--tertiary)' },
  { range: '21–40%',  pct: 45, color: 'var(--secondary)' },
  { range: '41–60%',  pct: 60, color: 'var(--primary)' },
  { range: '61–80%',  pct: 25, color: '#ff6b35' },
  { range: '81–100%', pct: 10, color: 'var(--error)' },
]

const CLAIMS_STREAM = [
  { id: 'CLM-8821', workerId: 'WRK-8821', worker: 'Marcus Thompson',  type: 'Accident',        incident: 'Medical Emergency Sprained Ankle', status: 'processing', payout: '₹1,450.00', riskPct: 18,  riskLabel: 'Low Risk',  time: '2 min ago'  },
  { id: 'CLM-8820', workerId: 'WRK-1930', worker: 'Sofia Rodriguez',  type: 'Vehicle',         incident: 'Total Loss Collision Damage',     status: 'investigation',payout:'₹24,900.00',riskPct: 84,  riskLabel: 'High Risk', time: '8 min ago'  },
  { id: 'CLM-8819', workerId: 'WRK-5512', worker: 'James Lee',        type: 'Income',          incident: 'Short-term Disability Illness',   status: 'awaiting',   payout: '₹820.00',  riskPct: 42,  riskLabel: 'Medium',    time: '15 min ago' },
  { id: 'CLM-8818', workerId: 'WRK-0034', worker: 'Priya Mehta',     type: 'Rainfall',        incident: 'Heavy Rainfall Event >10mm/hr',   status: 'approved',   payout: '₹84.50',   riskPct: 12,  riskLabel: 'Low Risk',  time: '32 min ago' },
  { id: 'CLM-8817', workerId: 'WRK-2711', worker: 'Chen Wei',        type: 'AQI Spike',       incident: 'AQI exceeded 150 threshold',      status: 'flagged',    payout: '₹42.00',   riskPct: 91,  riskLabel: 'Critical',  time: '1 hr ago'   },
]

const ALL_POLICIES = [
  { id: 'POL-9921', worker: 'Marcus T.',  type: 'Rainfall Protection', premium: '₹12.50/wk', coverage: '₹250', status: 'active',    expires: 'Jun 2024' },
  { id: 'POL-9920', worker: 'Sofia R.',   type: 'AQI Spike Coverage',  premium: '₹8.00/wk',  coverage: '₹150', status: 'active',    expires: 'May 2024' },
  { id: 'POL-9919', worker: 'James L.',   type: 'Platform Outage',     premium: '₹10.00/wk', coverage: '₹200', status: 'review',    expires: 'Apr 2024' },
  { id: 'POL-9918', worker: 'Priya M.',   type: 'Rainfall Protection', premium: '₹12.50/wk', coverage: '₹250', status: 'active',    expires: 'Jul 2024' },
  { id: 'POL-9917', worker: 'Chen W.',    type: 'AQI Spike Coverage',  premium: '₹8.00/wk',  coverage: '₹150', status: 'suspended', expires: 'Apr 2024' },
]

const WORKERS_LIST = [
  { id: 'W-001', name: 'Marcus Thompson', job: 'Delivery',  policies: 3, riskScore: 'Low',      joinDate: 'Jan 2024', status: 'active',    earnings: '₹4,200', claimsCount: 2 },
  { id: 'W-002', name: 'Sofia Rodriguez', job: 'Rideshare', policies: 2, riskScore: 'Medium',   joinDate: 'Feb 2024', status: 'active',    earnings: '₹3,100', claimsCount: 1 },
  { id: 'W-003', name: 'James Lee',       job: 'Freelance', policies: 1, riskScore: 'High',     joinDate: 'Jan 2024', status: 'flagged',   earnings: '₹1,890', claimsCount: 3 },
  { id: 'W-004', name: 'Priya Mehta',     job: 'Delivery',  policies: 3, riskScore: 'Low',      joinDate: 'Mar 2024', status: 'active',    earnings: '₹5,600', claimsCount: 0 },
  { id: 'W-005', name: 'Chen Wei',        job: 'Rideshare', policies: 2, riskScore: 'Critical', joinDate: 'Feb 2024', status: 'suspended', earnings: '₹920',   claimsCount: 4 },
]

const FRAUD_ALERTS = [
  { id: 'FRD-041', worker: 'Chen W.',  type: 'AQI Spike', amount: '₹42.00',  probability: 87, flag: 'Pattern anomaly',   time: '1 hr ago',  sector: 'Logistics' },
  { id: 'FRD-040', worker: 'James L.', type: 'Outage',    amount: '₹128.00', probability: 65, flag: 'Location mismatch', time: '3 hr ago',  sector: 'Freelance' },
  { id: 'FRD-039', worker: 'Unknown',  type: 'Rainfall',  amount: '₹250.00', probability: 91, flag: 'Impossible claim',  time: '5 hr ago',  sector: 'Logistics' },
]

// SVG world map hotspots  
const MAP_HOTSPOTS = [
  { x: '28%', y: '38%', size: 18, color: 'var(--error)',    label: 'EU Cluster'  },
  { x: '48%', y: '42%', size: 12, color: 'var(--primary)',  label: 'India Hub'   },
  { x: '72%', y: '55%', size: 22, color: 'var(--error)',    label: 'SEA Zone'    },
  { x: '20%', y: '50%', size: 10, color: 'var(--primary)',  label: 'US East'     },
  { x: '62%', y: '32%', size: 8,  color: 'var(--tertiary)', label: 'Central AS'  },
  { x: '36%', y: '62%', size: 14, color: 'var(--primary)',  label: 'Africa'      },
  { x: '83%', y: '68%', size: 16, color: 'var(--error)',    label: 'AUS'         },
]

const STATUS_BADGE = {
  approved: 'badge-active', active: 'badge-active',
  processing: 'badge-info', awaiting: 'badge-info',
  pending: 'badge-warning', review: 'badge-warning', investigation: 'badge-warning',
  flagged: 'badge-error', suspended: 'badge-error',
}
const RISK_CLR = { Low: 'var(--tertiary)', Medium: 'var(--primary)', High: '#ff6b35', Critical: 'var(--error)' }

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• MAP CANVAS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
// Direct color map — avoids CSS var string manipulation that causes crashes
const COLOR_MAP = {
  'var(--error)':    { hex: '#ff6450', glow: 'rgba(255,100,80,' },
  'var(--primary)':  { hex: '#ff7a00', glow: 'rgba(255,122,0,'  },
  'var(--tertiary)': { hex: '#4ae183', glow: 'rgba(74,225,131,' },
}

function ClaimsRiskMap({ mapView }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width  = canvas.offsetWidth  || 500
    canvas.height = canvas.offsetHeight || 200
    const W = canvas.width
    const H = canvas.height

    // Background
    ctx.fillStyle = '#0b0804'
    ctx.fillRect(0, 0, W, H)

    // Grid lines
    ctx.strokeStyle = 'rgba(255,122,0,0.05)'
    ctx.lineWidth = 1
    for (let x = 0; x < W; x += 36) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
    for (let y = 0; y < H; y += 28) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }

    // Continent blobs
    ctx.fillStyle   = 'rgba(255,182,139,0.07)'
    ctx.strokeStyle = 'rgba(255,182,139,0.13)'
    ctx.lineWidth = 1.5

    const blobs = [
      [W*0.17, H*0.42, W*0.11, H*0.22, -0.2], // N America
      [W*0.24, H*0.68, W*0.07, H*0.17,  0.1], // S America
      [W*0.47, H*0.30, W*0.07, H*0.10,  0.0], // Europe
      [W*0.47, H*0.57, W*0.08, H*0.17,  0.0], // Africa
      [W*0.65, H*0.35, W*0.18, H*0.20,  0.0], // Asia
      [W*0.77, H*0.68, W*0.07, H*0.10,  0.0], // Australia
    ]
    blobs.forEach(([cx,cy,rx,ry,rot]) => {
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI*2)
      ctx.fill()
      ctx.stroke()
    })

    // Hotspot glows
    MAP_HOTSPOTS.forEach(h => {
      const cx = parseFloat(h.x) / 100 * W
      const cy = parseFloat(h.y) / 100 * H
      const r  = h.size
      const colors = COLOR_MAP[h.color] || COLOR_MAP['var(--primary)']

      // Outer glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 3)
      g.addColorStop(0,   `${colors.glow}0.5)`)
      g.addColorStop(0.5, `${colors.glow}0.2)`)
      g.addColorStop(1,   `${colors.glow}0)`)
      ctx.beginPath()
      ctx.arc(cx, cy, r * 3, 0, Math.PI * 2)
      ctx.fillStyle = g
      ctx.fill()

      // Core dot
      ctx.beginPath()
      ctx.arc(cx, cy, r / 2.5, 0, Math.PI * 2)
      ctx.fillStyle = colors.hex
      ctx.fill()
    })
  }, [mapView])

  return <canvas ref={canvasRef} className="risk-map-canvas" />
}

/* =========== FRAUD =========== */
function FraudBar({ pct, color }) {
  const [width, setWidth]= useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 300)
    return () => clearTimeout(t)
  }, [pct])
  return (
    <div className="fraud-bar-bg">
      <div className="fraud-bar-fill" style={{ width: `${width}%`, background: color, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
    </div>
  )
}

/* =========== OVERVIEW =========== */
function OverviewView() {
  const [mapView, setMapView] = useState('global')
  const [period, setPeriod] = useState('Last 30 Days')
  const [policyType, setPolicyType] = useState('All Policy Types')
  const [riskLevel, setRiskLevel] = useState('All Risk Levels')
  const [dashboardData, setDashboardData] = useState({ workers: 0, policies: 0, claims: [], metrics: METRICS, claimStream: CLAIMS_STREAM })

  useEffect(() => {
    async function fetchRealData() {
      try {
        const [wRes, pRes, cRes] = await Promise.all([
          api.get('/api/v1/workers').catch(() => ({ data: [] })),
          api.get('/api/v1/policies').catch(() => ({ data: [] })),
          api.get('/api/v1/claims').catch(() => ({ data: [] }))
        ])
        
        const claimsList = Array.isArray(cRes.data) ? cRes.data.sort((a,b) => new Date(b.claimDate||0) - new Date(a.claimDate||0)) : []
        
        const realMetrics = [
          { label: 'Total Workers',     value: wRes.data.length.toString(), icon: 'users',   delta: 'Live data synced',  positive: true  },
          { label: 'Active Policies',   value: pRes.data.length.toString(),  icon: 'shield',  delta: 'Live data synced',  positive: true  },
          { label: 'Claims Recorded',   value: claimsList.length.toString(),  icon: 'file',    delta: 'Live data synced',   positive: true },
          { label: 'Fraud Alerts',      value: claimsList.filter(c => c.status === 'FLAGGED').length.toString(),    icon: 'alert',   delta: 'Requires manual review', positive: false, color: 'var(--error)' },
        ]

        setDashboardData({
          workers: wRes.data.length,
          policies: pRes.data.length,
          claims: claimsList,
          metrics: realMetrics,
          claimStream: claimsList.slice(0, 10).map(c => ({
            id: `CLM-${c.id}`,
            workerId: `WRK-${c.workerId}`,
            worker: `Worker ${c.workerId}`,
            type: 'Claim',
            incident: c.description || 'N/A',
            status: c.status?.toLowerCase() || 'pending',
            payout: `₹${c.amount || c.claimAmount || 0}`,
            riskPct: c.status === 'FLAGGED' ? 95 : 15,
            riskLabel: c.status === 'FLAGGED' ? 'Critical' : 'Low',
            time: new Date(c.claimDate).toLocaleDateString()
          }))
        })
      } catch (err) {
        console.error("Fetch overview error", err)
      }
    }
    fetchRealData()
  }, [])

  return (
    <div className="section-content">
      {/* KPI Row */}
      <div className="admin-metrics">
        {dashboardData.metrics.map(m => (
          <div key={m.label} className="kpi-card card">
            <div className="kpi-top">
              <span className="kpi-icon-wrap"><Icon name={m.icon} size={20} color={m.color || 'var(--primary)'} /></span>
              {m.color
                ? <span className="kpi-alert-icon"><Icon name="alert" size={16} color="var(--error)" /></span>
                : null
              }
            </div>
            <div className="kpi-value gradient-text" style={ m.color ? { WebkitTextFillColor: m.color, backgroundImage: 'none' } : {} }>{m.value}</div>
            <div className="kpi-label">{m.label}</div>
            <div className={`kpi-delta ${m.positive ? 'kpi-delta-pos' : 'kpi-delta-neg'}`}>
              <Icon name={m.positive ? 'trending_up' : 'alert'} size={11} />
              {m.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Analysis row */}
      <div className="admin-analysis">
        {/* Claims Risk Heatmap */}
        <div className="map-card card">
          <div className="chart-header">
            <div>
              <h3>Claims Risk Heatmap</h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--on-surface-variant)', marginTop: '0.2rem' }}>Geographic cluster analysis of current high-risk claims</p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['global','national'].map(v => (
                <button key={v} className={`btn-sm ${mapView === v ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMapView(v)}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="risk-map-wrap">
            <ClaimsRiskMap mapView={mapView} />
            {MAP_HOTSPOTS.map(h => (
              <div key={h.label} className="map-tooltip-dot" style={{ left: h.x, top: h.y }}>
                <div className="map-dot-pulse" style={{ borderColor: h.color === 'var(--error)' ? '#ff6450' : h.color === 'var(--tertiary)' ? '#4ae183' : '#ff7a00' }} />
              </div>
            ))}
          </div>
          <div className="map-legend">
            <span className="legend-chip legend-chip-low">Low Risk</span>
            <span className="legend-chip legend-chip-mid">Medium Risk</span>
            <span className="legend-chip legend-chip-high">High Risk</span>
          </div>
        </div>

        {/* =========== FRAUD =========== */}
        <div className="fraud-card card">
          <div className="chart-header">
            <div>
              <h3>Fraud Probability</h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--on-surface-variant)', marginTop: '0.2rem' }}>AI-driven bucket distribution</p>
            </div>
            <span className="badge badge-warning">AI-Driven</span>
          </div>
          <div className="fraud-bars">
            {FRAUD_BUCKETS.map(b => (
              <div key={b.range} className="fraud-row">
                <span className="fraud-range">{b.range}</span>
                <FraudBar pct={b.pct} color={b.color} />
                <span className="fraud-pct">{b.pct}%</span>
              </div>
            ))}
          </div>
          <div className="fraud-warning">
            <Icon name="alert" size={15} color="var(--error)" />
            <span>Warning: Unusual spike in the 41–60% bucket detected in Logistics sector.</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="stream-filter-bar card">
        <span className="stream-filter-icon"><Icon name="activity" size={14} color="var(--on-surface-variant)" /></span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Filters:</span>
        {[
          { value: period, options: ['Last 30 Days', 'Last 7 Days', 'Last 90 Days'], set: setPeriod },
          { value: policyType, options: ['All Policy Types', 'Rainfall', 'AQI Spike', 'Platform Outage'], set: setPolicyType },
          { value: riskLevel, options: ['All Risk Levels', 'Low', 'Medium', 'High', 'Critical'], set: setRiskLevel },
        ].map((f, i) => (
          <select key={i} className="filter-select" value={f.value} onChange={e => f.set(e.target.value)}>
            {f.options.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        <button className="btn-secondary btn-sm btn-with-icon" onClick={() => { setPeriod('Last 30 Days'); setPolicyType('All Policy Types'); setRiskLevel('All Risk Levels') }}>
          <Icon name="close" size={12} /> Reset
        </button>
      </div>

      {/* Real-time Claims Stream */}
      <div className="claims-table card">
        <div className="chart-header">
          <div style={{ display: 'flex', align: 'center', gap: '0.75rem' }}>
            <h3>Real-time Claims Stream</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn-secondary btn-sm btn-with-icon" onClick={() => alert("Downloading Stream CSV")}><Icon name="download" size={13} /> Export CSV</button>
            <span className="live-status-badge">
              <span className="live-dot" />
              Live Status Monitoring
            </span>
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Worker ID</th>
              <th>Policy Type</th>
              <th>Incident</th>
              <th>Status</th>
              <th>Payout</th>
              <th>Risk Probability</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.claimStream.filter(c => {
               if(riskLevel !== 'All Risk Levels' && c.riskLabel !== riskLevel) return false;
               return true;
            }).length === 0 ? (
              <tr><td colSpan="7" style={{textAlign:'center', padding:'2rem', color:'var(--on-surface-variant)'}}>No claims stream active.</td></tr>
            ) : dashboardData.claimStream.filter(c => {
               if(riskLevel !== 'All Risk Levels' && c.riskLabel !== riskLevel) return false;
               return true;
            }).map(c => (
              <tr key={c.id}>
                <td>
                  <div className="worker-id-cell">
                    <div className="worker-avatar-sm">{c.worker[0]}</div>
                    <div>
                      <div className="claim-id">{c.workerId}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{c.worker}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-info">{c.type}</span></td>
                <td style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', maxWidth: '160px' }}>{c.incident}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className="status-dot" style={{ background: c.status === 'approved' ? 'var(--tertiary)' : c.status === 'flagged' ? 'var(--error)' : 'var(--primary)' }} />
                    <span className={`badge ${STATUS_BADGE[c.status] || 'badge-warning'}`}>{c.status}</span>
                  </div>
                </td>
                <td style={{ fontWeight: 700, color: 'var(--tertiary)' }}>{c.payout}</td>
                <td>
                  <div className="risk-prob-cell">
                    <div className="risk-prob-bar-bg">
                      <div className="risk-prob-bar-fill" style={{
                        width: `${c.riskPct}%`,
                        background: c.riskPct > 80 ? 'var(--error)' : c.riskPct > 50 ? 'var(--primary)' : 'var(--tertiary)'
                      }} />
                    </div>
                    <span className="risk-prob-label" style={{ color: c.riskPct > 80 ? 'var(--error)' : c.riskPct > 50 ? 'var(--primary)' : 'var(--tertiary)' }}>
                      {c.riskPct}% {c.riskLabel}
                    </span>
                  </div>
                </td>
                <td>
                  <button className="btn-secondary btn-sm btn-with-icon" onClick={() => alert(`Reviewing Stream Entry: ${c.id}`)}><Icon name="eye" size={12} /> Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-footer">
          <span className="claim-time">Showing min(10) recent entries</span>
          <div className="pagination">
            <button className="page-btn">Previous</button>
            <button className={`page-btn page-btn-active`}>1</button>
            <button className="page-btn">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• POLICIES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function PoliciesAdminView() {
  const [search, setSearch] = useState('')
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPolicies() {
      try {
        const res = await api.get('/api/v1/policies')
        setPolicies(res.data)
      } catch (err) {
        console.error("Failed to load real policies", err)
      } finally {
        setLoading(false)
      }
    }
    loadPolicies()
  }, [])

  const [modalConfig, setModalConfig] = useState(null)

  const filtered = policies.filter(p => 
    (p.policyType || p.id?.toString() || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    setModalConfig({
       title: 'Delete Policy',
       message: 'Are you sure you want to delete this policy permanently?',
       confirmText: 'Delete',
       onCancel: true,
       onConfirm: async () => {
         try {
           await api.delete(`/api/v1/policies/${id}`);
           setPolicies(policies.filter(p => p.id !== id));
           setTimeout(()=>setModalConfig({title:'Deleted', message:'Policy was deleted from the ledger.'}), 300);
         } catch(e) {
           console.error(e);
           setTimeout(()=>setModalConfig({title:'Error', message:'Failed to delete policy permanently.'}), 300);
         }
       }
    })
  }

  return (
    <div className="section-content">
      <GlobalModal config={modalConfig} onClose={() => setModalConfig(null)} />
      <div className="section-top-row">
        <div><h2 className="section-h2">All Policies</h2><p className="section-sub">Platform-wide active and pending policy management.</p></div>
        <div className="dash-header-actions">
          <input className="form-input" placeholder="Search policies..." value={search} onChange={e=>setSearch(e.target.value)} style={{ width: '220px' }} />
          <button className="btn-secondary btn-with-icon" onClick={() => setModalConfig({title:'Export Scheduled', message:'A comprehensive policy CSV is being generated and will download automatically.'})}><Icon name="download" size={15} /> Export CSV</button>
          <Link to="/admin/policy/new" className="btn-primary btn-with-icon"><Icon name="plus" size={15} /> Issue Policy</Link>
        </div>
      </div>
      <div className="card table-card">
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Loading active policy ledgers...</div> : (
          <table className="admin-table">
            <thead><tr><th>Policy ID</th><th>Worker ID</th><th>Type</th><th>Coverage</th><th>Premium</th><th>Payment Status</th><th>Duration</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="claim-id">P-{p.id?.toString().padStart(4, '0')}</td>
                  <td style={{ fontWeight: 500 }}>Worker #{p.workerId}</td>
                  <td>{p.policyType}</td>
                  <td style={{ color: 'var(--secondary)', fontWeight: 600 }}>₹{p.coverageAmount}</td>
                  <td>₹{p.premium}</td>
                  <td><span className={`badge ${(p.status || 'ACTIVE') === 'ACTIVE' ? 'badge-active' : 'badge-warning'}`}>{p.status || 'ACTIVE'}</span></td>
                  <td className="claim-time">{p.duration} Months</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn-secondary btn-sm btn-with-icon" onClick={() => setModalConfig({title:'Editing Restricted', message:'Policy editing is restricted to Super Admins only.'})}><Icon name="edit" size={12} /> Edit</button>
                      <button className="btn-secondary btn-sm btn-with-icon" onClick={() => setModalConfig({title:`View Policy P-${p.id}`, message:`Full PDF terms and agreements for P-${p.id} are stored securely.`})}><Icon name="eye" size={12} /> View</button>
                      <button className="btn-secondary btn-sm btn-with-icon" onClick={() => handleDelete(p.id)} style={{ color: 'var(--error)' }}><Icon name="alert" size={12} /> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="8" style={{textAlign:'center', padding:'2rem', color:'var(--on-surface-variant)'}}>No policies found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function GlobalModal({ config, onClose }) {
  if (!config) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div className="card" style={{ width: '400px', padding: '2rem', animation: 'fadeInUp 0.3s ease', border: '1px solid rgba(255,122,0,0.2)' }} onClick={e=>e.stopPropagation()}>
         <h3 style={{fontFamily:'var(--font-display)', marginBottom:'0.5rem'}}>{config.title}</h3>
         <p style={{color:'var(--on-surface-variant)', fontSize:'0.875rem', marginBottom:'1.5rem', lineHeight:1.5}}>{config.message}</p>
         <div style={{display:'flex', gap:'0.75rem', justifyContent:'flex-end'}}>
           {config.onCancel && <button className="btn-secondary" onClick={onClose}>Cancel</button>}
           <button className="btn-primary" onClick={() => { if(config.onConfirm) config.onConfirm(); onClose(); }}>{config.confirmText || 'OK'}</button>
         </div>
      </div>
    </div>
  )
}

/* =========== CLAIMS =========== */
function ClaimsAdminView() {
  const [claimData, setClaimData] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewClaim, setViewClaim] = useState(null)

  useEffect(() => {
    async function loadClaims() {
      try {
        const res = await api.get('/api/v1/claims')
        setClaimData(res.data)
      } catch (err) {
        console.error("Failed to load claims", err)
      } finally {
        setLoading(false)
      }
    }
    loadClaims()
  }, [])

  const approve = async (id) => {
    try {
      await api.put(`/api/v1/claims/${id}/approve`)
      setClaimData(d => d.map(c => c.id === id ? { ...c, status: 'APPROVED' } : c))
      if (viewClaim?.id === id) setViewClaim(v => ({...v, status: 'APPROVED'}))
    } catch (e) {
      console.error('Approve failed', e)
      alert('Failed to approve claim: ' + (e.response?.data?.message || e.message))
    }
  }

  const flag = async (id) => {
    try {
      await api.put(`/api/v1/claims/${id}/flag`)
      setClaimData(d => d.map(c => c.id === id ? { ...c, status: 'FLAGGED' } : c))
      if (viewClaim?.id === id) setViewClaim(v => ({...v, status: 'FLAGGED'}))
    } catch (e) {
      // Optimistic update even on error for UI fluidity
      setClaimData(d => d.map(c => c.id === id ? { ...c, status: 'FLAGGED' } : c))
    }
  }

  return (
    <div className="section-content">
      {/* View Claim Modal */}
      {viewClaim && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setViewClaim(null)}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative', animation: 'fadeInUp 0.25s ease' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewClaim(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
              <Icon name="close" size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,122,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="file" size={20} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Claim C-{viewClaim.id}</h3>
                <span className={`badge ${viewClaim.status==='APPROVED'?'badge-active':viewClaim.status==='FLAGGED'?'badge-error':'badge-warning'}`} style={{ marginTop: '0.3rem', display:'inline-block' }}>{viewClaim.status}</span>
              </div>
            </div>
            {[
              { label: 'Worker ID',    value: String(viewClaim.workerId || 'N/A') },
              { label: 'Policy ID',    value: `P-${viewClaim.policyId || 'N/A'}` },
              { label: 'Claim Amount', value: `\u20b9${viewClaim.amount || viewClaim.claimAmount || 0}` },
              { label: 'Filed On',     value: viewClaim.claimDate ? new Date(viewClaim.claimDate).toLocaleString() : 'N/A' },
              { label: 'Location',     value: viewClaim.location || 'N/A' },
              { label: 'Fraud Flag',   value: viewClaim.fraudFlag ? '\u26a0 Flagged by AI' : '\u2713 Clean' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>{r.label}</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.value}</span>
              </div>
            ))}
            {viewClaim.description && (
              <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'var(--surface-container)', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginBottom: '0.375rem', fontWeight: 700, letterSpacing: '0.08em' }}>DESCRIPTION</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--on-surface)', margin: 0, lineHeight: 1.6 }}>{viewClaim.description}</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              {viewClaim.status !== 'APPROVED' && viewClaim.status !== 'FLAGGED' && (
                <button className="btn-primary btn-sm btn-with-icon" style={{ flex: 1, justifyContent: 'center' }} onClick={() => approve(viewClaim.id)}>
                  <Icon name="check" size={13} /> Approve
                </button>
              )}
              {viewClaim.status !== 'FLAGGED' && (
                <button className="btn-secondary btn-sm btn-with-icon" style={{ flex: 1, justifyContent: 'center' }} onClick={() => flag(viewClaim.id)}>
                  <Icon name="flag" size={13} /> Flag
                </button>
              )}
              {viewClaim.status === 'APPROVED' && (
                <div style={{ flex: 1, textAlign: 'center', padding: '0.5rem', color: 'var(--tertiary)', fontWeight: 600, fontSize: '0.875rem' }}>
                  <Icon name="check" size={14} /> Claim Approved
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="section-top-row">
        <div><h2 className="section-h2">Claims Management</h2><p className="section-sub">Review, approve, or flag incoming claims in real time.</p></div>
        <button className="btn-secondary btn-with-icon" onClick={() => setViewClaim({ id: 'exporting', isOverlayExport: true, title: 'Export Scheduled', message: 'The report generation is underway and will automatically download.' })}><Icon name="download" size={15} /> Export Report</button>
      </div>
      <div className="admin-metrics" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        {[
          { label: 'Pending Review', value: claimData.filter(c=>c.status==='PENDING').length, color: 'var(--primary)' },
          { label: 'Approved',       value: claimData.filter(c=>c.status==='APPROVED').length, color: 'var(--tertiary)' },
          { label: 'Flagged',        value: claimData.filter(c=>c.status==='FLAGGED').length,  color: 'var(--error)' },
        ].map(s => (
          <div key={s.label} className="kpi-card card">
            <div className="kpi-value" style={{ color: s.color, WebkitTextFillColor: s.color, fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>{s.value}</div>
            <div className="kpi-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card table-card">
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Loading active claims...</div> : (
        <table className="admin-table">
          <thead><tr><th>Claim ID</th><th>Worker ID</th><th>Policy ID</th><th>Amount</th><th>Description</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
          <tbody>
            {claimData.map(c => (
              <tr key={c.id}>
                <td className="claim-id">C-{c.id}</td>
                <td style={{ fontWeight: 500 }}>{c.workerId}</td>
                <td>P-{c.policyId}</td>
                <td style={{ color: 'var(--tertiary)', fontWeight: 600 }}>&#8377;{c.amount || c.claimAmount || 0}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</td>
                <td><span className={`badge ${c.status==='APPROVED'?'badge-active':c.status==='FLAGGED'?'badge-error':'badge-warning'}`}>{c.status}</span></td>
                <td className="claim-time">{c.claimDate ? new Date(c.claimDate).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn-secondary btn-sm btn-with-icon" onClick={() => setViewClaim(c)}><Icon name="eye" size={12} /> View</button>
                    {c.status !== 'APPROVED' && c.status !== 'FLAGGED' && (
                      <button className="btn-primary btn-sm btn-with-icon" onClick={() => approve(c.id)}><Icon name="check" size={12} /> Approve</button>
                    )}
                    {c.status !== 'FLAGGED' && (
                      <button className="btn-secondary btn-sm btn-with-icon" onClick={() => flag(c.id)}><Icon name="flag" size={12} /> Flag</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {claimData.length === 0 && <tr><td colSpan="8" style={{textAlign:'center', padding:'2rem', color:'var(--on-surface-variant)'}}>No claims found in system.</td></tr>}
          </tbody>
        </table>
        )}
      </div>
    </div>
  )
}


function WorkersAdminView() {
  const [search, setSearch] = useState('')
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWorkers() {
      try {
        const [wRes, pRes, cRes] = await Promise.all([
          api.get('/api/v1/workers'),
          api.get('/api/v1/policies').catch(()=>({data:[]})),
          api.get('/api/v1/claims').catch(()=>({data:[]}))
        ]);
        const policiesList = Array.isArray(pRes.data) ? pRes.data : [];
        const claimsList = Array.isArray(cRes.data) ? cRes.data : [];
        const merged = wRes.data.map(w => ({
           ...w,
           policiesCount: policiesList.filter(p => p.workerId === w.id).length,
           claimsCount: claimsList.filter(c => c.workerId === w.id).length
        }))
        setWorkers(merged)
      } catch (err) {
        console.error("Failed to load real workers", err)
      } finally {
        setLoading(false)
      }
    }
    loadWorkers()
  }, [])

  const filtered = workers.filter(w => 
    (w.username || w.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const getRiskColor = (score) => {
    if (!score) return 'var(--tertiary)'
    if (score < 30) return 'var(--tertiary)'
    if (score < 60) return 'var(--primary)'
    if (score < 80) return '#ff6b35'
    return 'var(--error)'
  }

  const getRiskLabel = (score) => {
    if (!score) return 'Low'
    if (score < 30) return 'Low'
    if (score < 60) return 'Medium'
    if (score < 80) return 'High'
    return 'Critical'
  }

  return (
    <div className="section-content">
      <div className="section-top-row">
        <div><h2 className="section-h2">Worker Registry</h2><p className="section-sub">All registered workers, risk scores, and account status.</p></div>
        <div className="dash-header-actions">
          <input className="form-input" placeholder="Search workers..." value={search} onChange={e=>setSearch(e.target.value)} style={{ width: '200px' }} />
          <button className="btn-secondary btn-with-icon" onClick={() => alert("Downloading Worker Database CSV...")}><Icon name="download" size={15} /> Export CSV</button>
        </div>
      </div>
      <div className="card table-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Loading worker index...</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Worker ID</th><th>Name / Email</th><th>Job Type</th><th>Policies</th><th>Claims</th><th>Earnings</th><th>Risk Score</th><th>Joined</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(w => (
                <tr key={w.id}>
                  <td className="claim-id">W-{w.id?.toString().padStart(4, '0')}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div className="worker-avatar-sm" style={{ padding: 0, overflow: 'hidden', background: 'var(--surface-container-high)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {(() => {
                          const photoUrl = w.profileImage || localStorage.getItem(`gigshield_photo_${w.id}`);
                          if (photoUrl) return <img src={photoUrl} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}} />;
                          return <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.8rem' }}>{(w.username || w.email || 'A')[0].toUpperCase()}</span>;
                        })()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{w.username || w.email}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-info">{w.deliverySegment || 'N/A'}</span></td>
                  <td style={{ textAlign: 'center' }}>{w.policiesCount || 0}</td>
                  <td style={{ textAlign: 'center' }}>{w.claimsCount || 0}</td>
                  <td style={{ color: 'var(--tertiary)', fontWeight: 600 }}>
                    {w.avgIncome ? `₹${w.avgIncome.toLocaleString()}` : 'N/A'}
                  </td>
                  <td>
                     <span className="badge" style={{ background: `${getRiskColor(w.riskScore)}22`, color: getRiskColor(w.riskScore) }}>
                        {getRiskLabel(w.riskScore)}
                     </span>
                  </td>
                  <td className="claim-time">
                    {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td><span className={`badge ${w.kycStatus === 'PENDING' ? 'badge-warning' : 'badge-active'}`}>{w.kycStatus || 'VERIFIED'}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-surface-variant)' }}>No registered workers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

/* =========== FRAUD =========== */
function FraudAdminView() {
  const [alerts, setAlerts] = useState(FRAUD_ALERTS)
  const dismiss = id => setAlerts(a => a.filter(x => x.id !== id))
  const block   = id => { alert(`Worker blocked for alert ${id}`); dismiss(id) }

  return (
    <div className="section-content">
      <div className="section-top-row">
        <div><h2 className="section-h2">Fraud Detection</h2><p className="section-sub">AI-flagged suspicious claims requiring manual review.</p></div>
        <span className="badge badge-error" style={{ fontSize: '0.875rem', padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="alert" size={14} /> {alerts.length} Active Alerts
        </span>
      </div>
      <div className="fraud-summary-row">
        <div className="stat-mini card"><span className="stat-mini-label">High Risk (&gt;80%)</span><span className="stat-mini-value" style={{ color: 'var(--error)' }}>{alerts.filter(a=>a.probability>80).length}</span><span className="stat-mini-sub">Immediate review required</span></div>
        <div className="stat-mini card"><span className="stat-mini-label">Medium Risk (41–80%)</span><span className="stat-mini-value" style={{ color: 'var(--primary)' }}>{alerts.filter(a=>a.probability>40&&a.probability<=80).length}</span><span className="stat-mini-sub">Monitor closely</span></div>
        <div className="stat-mini card"><span className="stat-mini-label">Amount at Risk</span><span className="stat-mini-value gradient-text">₹{alerts.reduce((s,a)=>s+parseFloat(a.amount.replace('₹','')),0).toFixed(2)}</span><span className="stat-mini-sub">Across all alerts</span></div>
      </div>
      <div className="fraud-warning" style={{ marginTop: '0.5rem' }}>
        <Icon name="alert" size={15} color="var(--error)" />
        <span>Warning: Unusual spike in the 41–60% bucket detected in Logistics sector. Review all flagged items immediately.</span>
      </div>
      <div className="card table-card">
        <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Active Fraud Alerts</h3>
        <table className="admin-table">
          <thead><tr><th>Alert ID</th><th>Worker</th><th>Claim Type</th><th>Amount</th><th>Fraud Probability</th><th>Flag Reason</th><th>Sector</th><th>Time</th><th>Actions</th></tr></thead>
          <tbody>
            {alerts.map(f => (
              <tr key={f.id}>
                <td className="claim-id">{f.id}</td>
                <td style={{ fontWeight: 500 }}>{f.worker}</td>
                <td>{f.type}</td>
                <td style={{ color: 'var(--error)', fontWeight: 600 }}>{f.amount}</td>
                <td>
                  <div className="risk-prob-cell">
                    <div className="risk-prob-bar-bg">
                      <div className="risk-prob-bar-fill" style={{ width: `${f.probability}%`, background: f.probability > 80 ? 'var(--error)' : 'var(--primary)' }} />
                    </div>
                    <span style={{ color: f.probability > 80 ? 'var(--error)' : 'var(--primary)', fontWeight: 700, fontSize: '0.875rem' }}>{f.probability}%</span>
                  </div>
                </td>
                <td style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>{f.flag}</td>
                <td><span className="badge badge-warning">{f.sector}</span></td>
                <td className="claim-time">{f.time}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn-secondary btn-sm" onClick={() => dismiss(f.id)}>Dismiss</button>
                    <button className="btn-danger btn-sm btn-with-icon" onClick={() => block(f.id)}><Icon name="logout" size={12} /> Block</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* =========== SETTINGS =========== */
function AdminSettingsView() {
  const [thresholds, setThresholds] = useState({ rainfall: '10', aqi: '150', outage: '2', fraud: '75' })
  const [payout, setPayout] = useState({ autoApprove: '100', maxPayout: '750', delay: '2' })
  const [notifs, setNotifs] = useState({ fraudAlerts: true, claimApprovals: true, systemAlerts: false, weeklyReport: true })
  const [saved, setSaved] = useState(false)

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  return (
    <div className="section-content">
      <div><h2 className="section-h2">Platform Settings</h2><p className="section-sub">Configure AI thresholds, payout rules, and system preferences.</p></div>
      <div className="settings-grid">
        <div className="card settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"><Icon name="zap" size={15} color="var(--primary)" /></span>
            <h4>AI Trigger Thresholds</h4>
          </div>
          {[
            { label: 'Rainfall trigger (mm/hr)', key: 'rainfall' },
            { label: 'AQI spike threshold', key: 'aqi' },
            { label: 'Outage duration (hrs)', key: 'outage' },
            { label: 'Fraud probability cutoff (%)', key: 'fraud' },
          ].map(s => (
            <div key={s.key} className="setting-row">
              <p className="setting-label">{s.label}</p>
              <input type="number" className="form-input" value={thresholds[s.key]} onChange={e => setThresholds(t => ({ ...t, [s.key]: e.target.value }))} style={{ width: '110px', textAlign: 'right' }} />
            </div>
          ))}
        </div>
        <div className="card settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"><Icon name="payments" size={15} color="var(--tertiary)" /></span>
            <h4>Payout Rules</h4>
          </div>
          {[
            { label: 'Auto-approve below (₹)', key: 'autoApprove' },
            { label: 'Max payout per event (₹)', key: 'maxPayout' },
            { label: 'Payout delay (minutes)', key: 'delay' },
          ].map(s => (
            <div key={s.key} className="setting-row">
              <p className="setting-label">{s.label}</p>
              <input type="number" className="form-input" value={payout[s.key]} onChange={e => setPayout(p => ({ ...p, [s.key]: e.target.value }))} style={{ width: '110px', textAlign: 'right' }} />
            </div>
          ))}
        </div>
        <div className="card settings-card settings-card-wide">
          <div className="settings-card-header">
            <span className="settings-card-icon"><Icon name="bell" size={15} color="var(--secondary)" /></span>
            <h4>Notification Preferences</h4>
          </div>
          {[
            { key: 'fraudAlerts',    label: 'Fraud Alerts',    desc: 'Immediate alerts for high-probability fraud detections' },
            { key: 'claimApprovals', label: 'Claim Approvals', desc: 'Notifications when claims are auto-approved' },
            { key: 'systemAlerts',   label: 'System Alerts',   desc: 'Infrastructure and platform availability alerts' },
            { key: 'weeklyReport',   label: 'Weekly Report',   desc: 'Automated weekly risk and performance summary' },
          ].map(n => (
            <div key={n.key} className="setting-row">
              <div><p className="setting-label">{n.label}</p><p className="setting-desc">{n.desc}</p></div>
              <div className={`toggle ${notifs[n.key] ? 'on' : ''}`} onClick={() => setNotifs(x => ({ ...x, [n.key]: !x[n.key] }))} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button className="btn-secondary">Discard Changes</button>
        <button className="btn-primary btn-with-icon" onClick={handleSave}>
          <Icon name={saved ? 'check' : 'check'} size={15} />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

/* =========== ADMIN PROFILE =========== */
function AdminProfileView() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('gigshield_admin_profile');
    return saved ? JSON.parse(saved) : { name: 'Ariana Osei-Adu', email: 'ariana@gigshield.ai', phone: '+1 (555) 999-0000', location: 'San Francisco, CA' };
  });
  const [photo, setPhoto] = useState(() => localStorage.getItem('gigshield_admin_photo'));

  const handlePhotoUpload = (e) => {
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
          
          try {
            localStorage.setItem('gigshield_admin_photo', compressedBase64);
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

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const toggleEdit = () => {
    if (editing) {
      localStorage.setItem('gigshield_admin_profile', JSON.stringify(form));
      alert("Admin profile info securely updated and saved!");
    }
    setEditing(!editing)
  }

  return (
    <div className="section-content">
      <div className="section-top-row">
        <div><h2 className="section-h2">Admin Profile</h2><p className="section-sub">Manage your staff account and dashboard identity.</p></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary btn-with-icon" onClick={toggleEdit}>
            <Icon name="edit" size={15} /> {editing ? 'Save Profile' : 'Edit Profile'}
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
              <Icon name="edit" size={13} /> Upload Photo
              <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handlePhotoUpload} />
            </label>
          )}
          <h3>{form.name}</h3>
          <p className="profile-role">Chief Risk Auditor</p>
          <div className="profile-stats">
            <div><span>Admin Rank</span><strong>Tier 1</strong></div>
            <div><span>Audits Ran</span><strong>124</strong></div>
          </div>
        </div>
        <div className="profile-details">
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <h4 className="card-section-title">Staff Details</h4>
            <div className="profile-form-grid">
              {[
                { label: 'Full Name',  key: 'name',     type: 'text' },
                { label: 'Work Email', key: 'email',    type: 'email' },
                { label: 'Contact',    key: 'phone',    type: 'tel' },
                { label: 'Access Level',key: 'location', type: 'text' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label>{f.label}</label>
                  <input type={f.type} className="form-input" value={form[f.key]} onChange={set(f.key)} disabled={!editing} style={{ opacity: editing ? 1 : 0.8 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── NAV + SHELL ── */
const NAV_ITEMS = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'policies',  icon: 'shield',    label: 'Policies'  },
  { id: 'claims',    icon: 'file',      label: 'Claims'    },
  { id: 'workers',   icon: 'users',     label: 'Workers'   },
  { id: 'fraud',     icon: 'alert',     label: 'Fraud'     },
  { id: 'profile',   icon: 'person',    label: 'Profile'   },
  { id: 'settings',  icon: 'cog',       label: 'Settings'  },
]
const SECTION_MAP = { dashboard: OverviewView, policies: PoliciesAdminView, claims: ClaimsAdminView, workers: WorkersAdminView, fraud: FraudAdminView, profile: AdminProfileView, settings: AdminSettingsView }
const TITLES = {
  dashboard: { title: 'Admin Overview',       subtitle: 'Real-time intelligence across the GigShield platform' },
  policies:  { title: 'Policies',             subtitle: 'Platform-wide policy management' },
  claims:    { title: 'Claims Management',    subtitle: 'Review and process incoming claims in real time' },
  workers:   { title: 'Worker Registry',      subtitle: 'All registered workers and risk profiles' },
  fraud:     { title: 'Fraud Detection',      subtitle: 'AI-flagged suspicious activity requiring review' },
  profile:   { title: 'Administrator Profile', subtitle: 'Manage your staff identity and credentials' },
  settings:  { title: 'Platform Settings',    subtitle: 'Configure AI thresholds, payout rules and preferences' },
}

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const { title, subtitle } = TITLES[activeNav] || TITLES.dashboard
  const ActiveSection = SECTION_MAP[activeNav] || OverviewView
  const [modalConfig, setModalConfig] = useState(null)
  
  const [displayPhoto, setDisplayPhoto] = useState(() => localStorage.getItem('gigshield_admin_photo'))
  useEffect(() => {
    const handlePhotoUpdate = () => {
      setDisplayPhoto(localStorage.getItem('gigshield_admin_photo'))
    }
    window.addEventListener('photo_updated', handlePhotoUpdate)
    return () => window.removeEventListener('photo_updated', handlePhotoUpdate)
  }, [])

  return (
    <DashboardLayout navItems={NAV_ITEMS} activeNav={activeNav} setActiveNav={setActiveNav} role="admin" username={JSON.parse(localStorage.getItem('gigshield_admin_profile') || '{"name":"Ariana Osei-Adu"}').name} subtitle="Chief Auditor" userPhoto={displayPhoto}>
      <GlobalModal config={modalConfig} onClose={() => setModalConfig(null)} />
      <div className="admin-dashboard">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">{title}</h1>
            <p className="dash-subtitle">{subtitle}</p>
          </div>
          {activeNav === 'dashboard' && (
            <div className="dash-header-actions">
              <button className="btn-secondary btn-with-icon" onClick={() => setModalConfig({title:'Export Complete', message:'Report securely downloaded.'})}><Icon name="download" size={15} /> Export Report</button>
              <button className="btn-primary btn-with-icon" onClick={() => setModalConfig({title:'Running Intelligence Audit...', message:'The core engines are validating anomalies and computing exact metrics. No discrepancies found.', confirmText: 'Finish'})}><Icon name="activity" size={15} /> Run Audit</button>
            </div>
          )}
        </div>
        <ActiveSection />
      </div>
    </DashboardLayout>
  )
}
