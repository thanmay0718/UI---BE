import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Icon } from './Icons'
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

  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState([
    { title: "Policy Activated", desc: "Your new protection plan is active.", time: "2m ago" },
    { title: "Premium Payment", desc: "Premium deduction of ₹12.50 successful.", time: "1h ago" }
  ]);
  
  const markAllRead = () => {
    setNotifs([]);
  };

  return (
    <div className="dash-root">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Link to="/" className="brand-link">
            <div className="brand-icon">
              <Icon name="shield" size={16} color="var(--on-primary-fixed)" strokeWidth={2} />
            </div>
            <span className="brand-name">GigShield <span className="brand-ai">AI</span></span>
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
                <Icon name={item.icon} size={18} strokeWidth={activeNav === item.id ? 2.2 : 1.75} />
              </span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-row">
            {userPhoto ? (
              <img src={userPhoto} alt={username} className="user-avatar" style={{ objectFit: 'cover', borderRadius: '50%', width: '32px', height: '32px' }} />
            ) : (
              <div className="user-avatar">{initial}</div>
            )}
            <div className="user-info">
              <span className="user-name">{username}</span>
              <span className="user-sub">{subtitle}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} aria-label="Logout">
            <Icon name="logout" size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dash-main" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 2rem 0', zIndex: 50 }}>
           <div style={{ position: 'relative' }}>
             <button 
               onClick={() => setShowNotif(!showNotif)}
               style={{ background: 'var(--surface-container)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
             >
               <Icon name="bell" size={18} color="var(--on-surface)" />
               {notifs.length > 0 && <span style={{ position: 'absolute', top: '8px', right: '10px', width: '8px', height: '8px', background: 'var(--error)', borderRadius: '50%', border: '2px solid var(--surface-container)' }}></span>}
             </button>
             {showNotif && (
               <div className="card glass" style={{ position: 'absolute', top: '50px', right: 0, width: '320px', padding: '0', overflow: 'hidden', zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: '1px solid var(--border-color)' }}>
                 <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--on-surface)' }}>Notifications</h4>
                   {notifs.length > 0 && <span onClick={markAllRead} style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer' }}>Mark all read</span>}
                 </div>
                 <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifs.length === 0 ? (
                       <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>
                         You're all caught up!
                       </div>
                    ) : notifs.map((n, i) => (
                      <div key={i} className="notif-item" style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.75rem', cursor: 'pointer' }}>
                         <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '6px', flexShrink: 0 }}></div>
                         <div>
                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--on-surface)' }}>{n.title}</p>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.75rem', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>{n.desc}</p>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--tertiary)' }}>{n.time}</p>
                         </div>
                      </div>
                    ))}
                 </div>
                 <div onClick={() => setShowNotif(false)} style={{ padding: '0.75rem', textAlign: 'center', background: 'var(--surface-container)', fontSize: '0.8rem', color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
                   View all notifications
                 </div>
               </div>
             )}
           </div>
        </header>
        <div>
          {children}
        </div>
      </main>
    </div>
  )
}
