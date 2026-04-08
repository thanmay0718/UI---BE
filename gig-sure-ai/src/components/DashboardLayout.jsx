import { Link, useNavigate } from 'react-router-dom'
import { Icon } from './Icons'
import NavBar from './NavBar'
import './DashboardLayout.css'
import api from '../services/api'

export default function DashboardLayout({
  children, navItems, activeNav, setActiveNav, role, username, subtitle, userPhoto
}) {
  const navigate = useNavigate()
  const initial = username ? username[0].toUpperCase() : 'U'

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error("Logout error", err);
    }
    navigate('/login')
  }

  /* ── Search navigation: map section name → nav item id ── */
  const handleSearchNavigate = (section) => {
    // Try to find a navItem matching the section
    const match = navItems.find(
      item => item.id === section || item.label.toLowerCase().includes(section.toLowerCase())
    )
    if (match) {
      setActiveNav(match.id)
    }
  }

  return (
    <div className="dash-root">
      {/* ── Glassmorphic Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Link to="/" className="brand-link">
            <div className="brand-icon">
              <Icon name="shield" size={16} color="rgba(50,18,0,0.9)" strokeWidth={2} />
            </div>
            <span className="brand-name">
              GigShield <span className="brand-ai">AI</span>
            </span>
          </Link>
          <span className={`role-pill role-${role}`}>{role}</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
              aria-label={item.label}
            >
              <span className="nav-icon">
                <Icon
                  name={item.icon}
                  size={17}
                  strokeWidth={activeNav === item.id ? 2.2 : 1.75}
                  color={activeNav === item.id ? 'rgba(255,182,139,1)' : 'currentColor'}
                />
              </span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="user-row">
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={username}
                className="user-avatar"
                style={{ objectFit: 'cover', borderRadius: '50%', width: '34px', height: '34px' }}
              />
            ) : (
              <div className="user-avatar">{initial}</div>
            )}
            <div className="user-info">
              <span className="user-name">{username}</span>
              <span className="user-sub">{subtitle}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="dash-main">
        {/* Glassmorphic NavBar */}
        <NavBar
          username={username}
          subtitle={subtitle}
          role={role}
          onLogout={handleLogout}
          onSearchNavigate={handleSearchNavigate}
        />

        {/* Page content */}
        <div className="dash-content">
          {children}
        </div>
      </main>
    </div>
  )
}
