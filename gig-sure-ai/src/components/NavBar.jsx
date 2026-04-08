import { useState, useRef, useEffect } from 'react'
import { Icon } from './Icons'
import './NavBar.css'

/* ─── Search data per role ─── */
const ADMIN_SEARCH_DATA = [
  { label: 'Workers Overview',      section: 'workers',  icon: 'users'    },
  { label: 'Claims Management',     section: 'claims',   icon: 'file'     },
  { label: 'Active Policies',       section: 'policies', icon: 'shield'   },
  { label: 'Fraud Detection',       section: 'fraud',    icon: 'alert'    },
  { label: 'Platform Overview',     section: 'overview', icon: 'dashboard'},
  { label: 'Marcus Thompson',       section: 'workers',  icon: 'person'   },
  { label: 'Sofia Rodriguez',       section: 'workers',  icon: 'person'   },
  { label: 'Claims Risk Heatmap',   section: 'overview', icon: 'chart'    },
  { label: 'Fraud Probability',     section: 'overview', icon: 'zap'      },
  { label: 'Issue New Policy',      section: 'policies', icon: 'plus'     },
]

const WORKER_SEARCH_DATA = [
  { label: 'My Dashboard',          section: 'dashboard', icon: 'dashboard' },
  { label: 'My Policies',           section: 'policies',  icon: 'shield'    },
  { label: 'Claims History',        section: 'claims',    icon: 'file'      },
  { label: 'Earnings & Payouts',    section: 'earnings',  icon: 'payments'  },
  { label: 'My Profile',            section: 'profile',   icon: 'person'    },
  { label: 'Settings & Security',   section: 'settings',  icon: 'cog'       },
  { label: 'File a New Claim',      section: 'claims',    icon: 'plus'      },
  { label: 'Add Policy',            section: 'policies',  icon: 'plus'      },
  { label: 'Rainfall Protection',   section: 'policies',  icon: 'rain'      },
  { label: 'AQI Spike Coverage',    section: 'policies',  icon: 'wind'      },
]

export default function NavBar({ username, subtitle, onLogout, role, onSearchNavigate }) {
  const [showNotif,   setShowNotif]   = useState(false)
  const [searchVal,   setSearchVal]   = useState('')
  const [showResults, setShowResults] = useState(false)
  const [notifs, setNotifs] = useState([
    { title: 'Policy Activated',  desc: 'Your new protection plan is now active.',       time: '2m ago'  },
    { title: 'Premium Payment',   desc: 'Premium deduction of ₹12.50 was successful.',  time: '1h ago'  },
    { title: 'Claim Update',      desc: 'Claim #7823 has been moved to review.',         time: '3h ago'  },
  ])

  const dropdownRef = useRef(null)
  const searchRef   = useRef(null)

  /* ── Close notification dropdown on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotif(false)
      }
    }
    if (showNotif) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showNotif])

  /* ── Close search results on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const searchData = role === 'admin' ? ADMIN_SEARCH_DATA : WORKER_SEARCH_DATA

  /* ── Live filtered results ── */
  const results = searchVal.trim().length >= 1
    ? searchData.filter(item =>
        item.label.toLowerCase().includes(searchVal.toLowerCase())
      ).slice(0, 6)
    : []

  const handleResultClick = (item) => {
    setSearchVal('')
    setShowResults(false)
    if (onSearchNavigate) onSearchNavigate(item.section)
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* Left — greeting */}
        <div className="navbar-greeting">
          <span className="navbar-greeting-title">
            {greeting()}, {username || 'User'} 👋
          </span>
          <span className="navbar-greeting-sub">
            {subtitle || (role === 'admin' ? 'Platform Administrator' : 'Worker Dashboard')}
          </span>
        </div>

        {/* Center — Search */}
        <div className="navbar-search-wrap" ref={searchRef}>
          <span className="navbar-search-icon">
            <Icon name="search" size={15} color="currentColor" />
          </span>
          <input
            id="navbar-search"
            type="text"
            className="navbar-search-input"
            placeholder={role === 'admin'
              ? 'Search workers, claims, policies…'
              : 'Search policies, claims, settings…'}
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value)
              setShowResults(e.target.value.trim().length >= 1)
            }}
            onFocus={() => { if (searchVal.trim().length >= 1) setShowResults(true) }}
            autoComplete="off"
          />
          {/* Clear button */}
          {searchVal && (
            <button
              className="navbar-search-clear"
              onClick={() => { setSearchVal(''); setShowResults(false) }}
              aria-label="Clear search"
            >
              <Icon name="close" size={12} color="currentColor" />
            </button>
          )}

          {/* ── Search results dropdown ── */}
          {showResults && results.length > 0 && (
            <div className="search-dropdown">
              <div className="search-dropdown-header">
                Quick Navigate
              </div>
              {results.map((item, i) => (
                <div
                  key={i}
                  className="search-result-item"
                  onClick={() => handleResultClick(item)}
                >
                  <span className="search-result-icon">
                    <Icon name={item.icon} size={14} color="currentColor" />
                  </span>
                  <div className="search-result-text">
                    <span className="search-result-label">
                      {item.label.replace(
                        new RegExp(`(${searchVal})`, 'gi'),
                        '<mark>$1</mark>'
                      ).split(/(<mark>[^<]*<\/mark>)/g).map((part, j) =>
                        part.startsWith('<mark>') ? (
                          <mark key={j} className="search-highlight">
                            {part.replace(/<\/?mark>/g, '')}
                          </mark>
                        ) : part
                      )}
                    </span>
                    <span className="search-result-section">→ {item.section}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {showResults && results.length === 0 && searchVal.trim().length >= 1 && (
            <div className="search-dropdown">
              <div className="search-no-results">
                No results for "<strong>{searchVal}</strong>"
              </div>
            </div>
          )}
        </div>

        {/* Right — actions */}
        <div className="navbar-actions">

          {/* Notification bell */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              id="navbar-notif-btn"
              className="navbar-icon-btn"
              onClick={() => setShowNotif((v) => !v)}
              aria-label="Notifications"
            >
              <Icon name="bell" size={17} color="currentColor" />
              {notifs.length > 0 && <span className="navbar-notif-dot" />}
            </button>

            {showNotif && (
              <div className="notif-dropdown">
                <div className="notif-dropdown-header">
                  <span className="notif-dropdown-title">
                    Notifications {notifs.length > 0 && `(${notifs.length})`}
                  </span>
                  {notifs.length > 0 && (
                    <button className="notif-mark-read" onClick={() => setNotifs([])}>
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="notif-list">
                  {notifs.length === 0 ? (
                    <div className="notif-empty">
                      <span className="notif-empty-icon">🎉</span>
                      You're all caught up!
                    </div>
                  ) : (
                    notifs.map((n, i) => (
                      <div key={i} className="notif-item">
                        <div className="notif-dot" />
                        <div>
                          <p className="notif-item-title">{n.title}</p>
                          <p className="notif-item-desc">{n.desc}</p>
                          <p className="notif-item-time">{n.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="notif-dropdown-footer" onClick={() => setShowNotif(false)}>
                  View all notifications →
                </div>
              </div>
            )}
          </div>

          <div className="navbar-divider" />

          {/* Logout */}
          <button
            id="navbar-logout-btn"
            className="navbar-logout-btn"
            onClick={onLogout}
            aria-label="Logout"
          >
            <Icon name="logout" size={14} color="currentColor" />
            <span>Logout</span>
          </button>

        </div>
      </div>
    </header>
  )
}
