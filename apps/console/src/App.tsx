/* ═══════════════════════════════════════════════════════════════════
   HomeNest Console — App Shell (React, Bootstrap + GitHub Dark)
   Sidebar-driven layout for device-ready home media/automation control.
   ═══════════════════════════════════════════════════════════════════ */
import React, { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useHomenestStore } from './stores/homenestStore'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Views
import Dashboard from './views/Dashboard'
import Media from './views/Media'
import Automation from './views/Automation'
import TvEpg from './views/TvEpg'
import Recordings from './views/Recordings'
import Settings from './views/Settings'
import USXSurface from './views/USXSurface'

// ─── Nav Items ──────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'bi-speedometer2' },
  { path: '/media', label: 'Media', icon: 'bi-play-circle' },
  { path: '/automation', label: 'Automation', icon: 'bi-lightning-charge' },
  { path: '/tv', label: 'TV Guide', icon: 'bi-tv' },
  { path: '/recordings', label: 'Recordings', icon: 'bi-camera-video' },
  { path: '/usx', label: 'USX Surface', icon: 'bi-grid-3x3-gap' },
  { path: '/settings', label: 'Settings', icon: 'bi-gear' },
]

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar, connectMcp, systemStatus, snackbar, dismissSnackbar } = useHomenestStore()

  useEffect(() => {
    connectMcp()
  }, [connectMcp])

  const servicesOnline = systemStatus.services.filter(s => s.status === 'running').length
  const servicesTotal = systemStatus.services.length

  return (
    <div className="homenest-app">
      {/* ─── Sidebar ──────────────────────────────────────────── */}
      <aside className={`homenest-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <svg className="sidebar-brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {!sidebarCollapsed && (
              <>
                <span className="sidebar-brand-text">HomeNest</span>
                <span className="sidebar-brand-version">v{systemStatus.version}</span>
              </>
            )}
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {sidebarCollapsed
                ? <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
                : <><line x1="9" y1="18" x2="15" y2="12"/><line x1="15" y1="12" x2="9" y2="6"/></>
              }
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-item-icon"><i className={`bi ${item.icon}`} /></span>
              <span className="nav-item-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="system-status">
            <span className={`status-dot ${servicesOnline > 0 ? 'online' : 'offline'}`} />
            <span>{servicesOnline}/{servicesTotal} services</span>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────── */}
      <main className="homenest-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/media" element={<Media />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/tv" element={<TvEpg />} />
          <Route path="/recordings" element={<Recordings />} />
          <Route path="/usx" element={<USXSurface />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      {/* ─── Snackbar ─────────────────────────────────────────── */}
      {snackbar && (
        <div className="hn-snackbar">
          <span>{snackbar.message}</span>
          {snackbar.action && (
            <button className="hn-snackbar-action" onClick={dismissSnackbar}>
              {snackbar.action}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
