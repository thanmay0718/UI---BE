import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icons'
import DashboardLayout from '../components/DashboardLayout'
import api from '../services/api'
import './WorkerDashboard.css'
import './WorkerClaimsHistory.css'

const PAGE_SIZE = 8

const STATUS_OPTIONS = ['All', 'PENDING', 'APPROVED', 'FLAGGED']
const TYPE_OPTIONS   = ['All', 'RAINFALL', 'AQI', 'OUTAGE', 'TRAFFIC']
const SORT_OPTIONS   = [
  { label: 'Newest First',   value: 'date_desc'   },
  { label: 'Oldest First',   value: 'date_asc'    },
  { label: 'Amount (High)',  value: 'amount_desc' },
  { label: 'Amount (Low)',   value: 'amount_asc'  },
]

const statusBadge = s => ({
  APPROVED: 'badge-active',
  FLAGGED:  'badge-error',
  PENDING:  'badge-warning',
}[s] || 'badge-info')

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'policies',  icon: 'shield',    label: 'Policies'  },
  { id: 'claims',    icon: 'file',      label: 'Claims'    },
  { id: 'earnings',  icon: 'payments',  label: 'Payment History' },
  { id: 'profile',   icon: 'person',    label: 'Profile'   },
  { id: 'settings',  icon: 'cog',       label: 'Settings'  },
]

export default function WorkerClaimsHistory() {
  const navigate = useNavigate()
  const [claims, setClaims]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [workerId, setWorkerId]   = useState(null)
  const [activeNav, setActiveNav] = useState('claims')

  // Filters
  const [search,      setSearch]      = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter,   setTypeFilter]   = useState('All')
  const [sort,         setSort]         = useState('date_desc')
  const [page,         setPage]         = useState(1)

  // Selected claim for detail view
  const [viewClaim, setViewClaim] = useState(null)

  // User info for sidebar
  const savedProfile = (() => { try { return JSON.parse(localStorage.getItem('gigshield_profile')) } catch { return null } })()
  const displayName  = savedProfile?.name || 'Worker'
  const displayPhoto = localStorage.getItem('gigshield_photo')

  useEffect(() => {
    async function load() {
      try {
        const pRes = await api.get('/auth/profile')
        const id   = pRes.data?.id
        setWorkerId(id)
        if (id) {
          const cRes = await api.get('/api/v1/claims')
          setClaims(cRes.data.filter(c => c.workerId === id))
        }
      } catch (err) {
        console.error('Failed loading claims', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  /* ── Derived filtered + sorted list ── */
  const filtered = useMemo(() => {
    let list = [...claims]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        String(c.id).includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        String(c.policyId).includes(q)
      )
    }

    // Status filter
    if (statusFilter !== 'All') list = list.filter(c => c.status === statusFilter)

    // Type filter (based on description prefix)
    if (typeFilter !== 'All') list = list.filter(c => (c.description || '').toUpperCase().includes(typeFilter))

    // Sort
    list.sort((a, b) => {
      switch (sort) {
        case 'date_asc':    return new Date(a.claimDate) - new Date(b.claimDate)
        case 'date_desc':   return new Date(b.claimDate) - new Date(a.claimDate)
        case 'amount_desc': return (b.amount || 0) - (a.amount || 0)
        case 'amount_asc':  return (a.amount || 0) - (b.amount || 0)
        default: return 0
      }
    })
    return list
  }, [claims, search, statusFilter, typeFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const resetFilters = () => {
    setSearch(''); setStatusFilter('All'); setTypeFilter('All'); setSort('date_desc'); setPage(1)
  }

  // Stats
  const stats = {
    total:    claims.length,
    pending:  claims.filter(c => c.status === 'PENDING').length,
    approved: claims.filter(c => c.status === 'APPROVED').length,
    flagged:  claims.filter(c => c.status === 'FLAGGED').length,
    totalPaid: claims.filter(c => c.status === 'APPROVED').reduce((s, c) => s + (c.amount || 0), 0),
  }

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      activeNav={activeNav}
      setActiveNav={id => {
        if (id === 'claims') return
        if (id === 'dashboard') navigate('/worker')
        else navigate(`/worker?tab=${id}`)
      }}
      role="worker"
      username={displayName}
      subtitle="Gig Worker"
      userPhoto={displayPhoto}
    >
      {/* Claim Detail Modal */}
      {viewClaim && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          onClick={() => setViewClaim(null)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative', animation: 'fadeInUp 0.25s ease' }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setViewClaim(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
              <Icon name="close" size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,122,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="file" size={22} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-display)' }}>Claim C-{viewClaim.id}</h3>
                <span className={`badge ${statusBadge(viewClaim.status)}`} style={{ marginTop: '0.25rem', display: 'inline-block' }}>{viewClaim.status}</span>
              </div>
            </div>

            {[
              { label: 'Policy ID',     value: `P-${viewClaim.policyId}` },
              { label: 'Claimed Amount',value: `₹${(viewClaim.amount || 0).toFixed(2)}` },
              { label: 'Filed On',      value: viewClaim.claimDate ? new Date(viewClaim.claimDate).toLocaleString() : 'N/A' },
              { label: 'Location',      value: viewClaim.location || 'Not specified' },
              { label: 'Fraud Check',   value: viewClaim.fraudFlag ? '\u26A0 AI Flagged' : '\u2713 Clear' },
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

            <div style={{ marginTop: '1.5rem', padding: '0.875rem', background: viewClaim.status === 'APPROVED' ? 'rgba(74,225,131,0.08)' : viewClaim.status === 'FLAGGED' ? 'rgba(255,100,80,0.08)' : 'rgba(255,122,0,0.08)', borderRadius: '10px', border: `1px solid ${viewClaim.status === 'APPROVED' ? 'rgba(74,225,131,0.25)' : viewClaim.status === 'FLAGGED' ? 'rgba(255,100,80,0.25)' : 'rgba(255,122,0,0.25)'}` }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                {viewClaim.status === 'APPROVED' && '\u2713 This claim has been approved and payout is being processed.'}
                {viewClaim.status === 'PENDING'  && '\u23F3 Your claim is under AI review. Usually resolved within 2 minutes.'}
                {viewClaim.status === 'FLAGGED'  && '\u26A0 This claim has been flagged for manual review by our risk team.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="worker-dashboard">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Claims History</h1>
            <p className="dash-subtitle">All your past and active claims with payout status</p>
          </div>
          <Link to="/claim" className="btn-primary btn-with-icon">
            <Icon name="plus" size={16} /> File New Claim
          </Link>
        </div>

        <div className="section-content">
          {/* KPI stats row */}
          <div className="claims-kpi-row">
            {[
              { label: 'Total Claims',    value: stats.total,    color: 'var(--primary)',    icon: 'file' },
              { label: 'Pending',         value: stats.pending,  color: 'var(--primary)',    icon: 'activity' },
              { label: 'Approved',        value: stats.approved, color: 'var(--tertiary)',   icon: 'check' },
              { label: 'Total Paid Out',  value: `₹${stats.totalPaid.toFixed(0)}`, color: 'var(--tertiary)', icon: 'payments' },
              { label: 'Flagged',         value: stats.flagged,  color: 'var(--error)',      icon: 'alert' },
            ].map(s => (
              <div key={s.label} className="claim-kpi-card card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>{s.label}</span>
                  <Icon name={s.icon} size={16} color={s.color} />
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters bar */}
          <div className="claims-filter-bar card">
            <div className="claims-filter-inner">
              {/* Search */}
              <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 0 }}>
                <Icon name="activity" size={14} color="var(--on-surface-variant)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  className="form-input"
                  placeholder="Search by claim ID, description..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
                />
              </div>

              {/* Status */}
              <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
                {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>

              {/* Type */}
              <select className="filter-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
                {TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>

              {/* Sort */}
              <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              {/* Reset */}
              {(search || statusFilter !== 'All' || typeFilter !== 'All' || sort !== 'date_desc') && (
                <button className="btn-secondary btn-sm btn-with-icon" onClick={resetFilters}>
                  <Icon name="close" size={12} /> Reset
                </button>
              )}
            </div>

            <p style={{ fontSize: '0.775rem', color: 'var(--on-surface-variant)', marginTop: '0.625rem' }}>
              Showing {paginated.length} of {filtered.length} claims
            </p>
          </div>

          {/* Claims table card */}
          <div className="card table-card">
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,122,0,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>Loading your claims ledger…</p>
              </div>
            ) : paginated.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center' }}>
                <Icon name="file" size={48} color="var(--on-surface-variant)" />
                <p style={{ color: 'var(--on-surface-variant)', marginTop: '1rem', fontSize: '0.95rem' }}>
                  {claims.length === 0 ? "You haven't filed any claims yet." : "No claims match your filters."}
                </p>
                {claims.length === 0 && (
                  <Link to="/claim" className="btn-primary btn-with-icon" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                    <Icon name="plus" size={15} /> File Your First Claim
                  </Link>
                )}
              </div>
            ) : (
              <table className="worker-table">
                <thead>
                  <tr>
                    <th>Claim ID</th>
                    <th>Policy</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Filed On</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(c => {
                    const typeMatch = (c.description || '').match(/\[([^\]]+)\]/)
                    const claimType = typeMatch ? typeMatch[1] : 'N/A'
                    return (
                      <tr key={c.id} className="claims-table-row" onClick={() => setViewClaim(c)} style={{ cursor: 'pointer' }}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>C-{c.id}</span>
                        </td>
                        <td style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>P-{c.policyId}</td>
                        <td>
                          <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{claimType}</span>
                        </td>
                        <td style={{ fontWeight: 700, color: c.status === 'APPROVED' ? 'var(--tertiary)' : 'var(--on-surface)' }}>
                          ₹{(c.amount || 0).toFixed(2)}
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
                          {c.claimDate ? new Date(c.claimDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td>
                          <span className={`badge ${statusBadge(c.status)}`}>{c.status}</span>
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <button
                            className="btn-secondary btn-sm btn-with-icon"
                            onClick={() => setViewClaim(c)}
                          >
                            <Icon name="eye" size={13} /> View
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="claims-pagination">
                <button
                  className="page-btn"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  ← Previous
                </button>
                <div className="page-pills">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                    if (totalPages > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== totalPages) {
                      if (p === 2 && page > 4) return <span key={p} style={{ color: 'var(--on-surface-variant)', padding: '0 0.25rem' }}>…</span>
                      if (p === totalPages - 1 && page < totalPages - 3) return <span key={p} style={{ color: 'var(--on-surface-variant)', padding: '0 0.25rem' }}>…</span>
                      if (Math.abs(p - page) > 2 && p !== 1 && p !== totalPages) return null
                    }
                    return (
                      <button
                        key={p}
                        className={`page-btn ${page === p ? 'page-btn-active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>
                <button
                  className="page-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
