/* ═══════════════════════════════════════════════════════════════════
   HomeNest Console — Dashboard View
   System overview with service status, uptime, and quick actions.
   ═══════════════════════════════════════════════════════════════════ */
import { useEffect } from 'react'
import { useHomenestStore } from '../stores/homenestStore'

export default function Dashboard() {
  const { systemStatus, loading, connectMcp } = useHomenestStore()

  useEffect(() => {
    connectMcp()
  }, [connectMcp])

  if (loading) {
    return (
      <div className="content-area">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Connecting to HomeNest...</span>
        </div>
      </div>
    )
  }

  const runningServices = systemStatus.services.filter(s => s.status === 'running')

  return (
    <div className="content-area">
      {/* ─── Top Bar ──────────────────────────────────────────── */}
      <div className="top-bar">
        <h1 className="top-bar-title">Dashboard</h1>
        <div className="top-bar-actions">
          <button className="hn-btn hn-btn-sm" onClick={connectMcp}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* ─── Stats ────────────────────────────────────────────── */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">System Uptime</div>
          <div className="stat-value">{systemStatus.uptime}</div>
          <div className="stat-sub">HomeNest v{systemStatus.version}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Services</div>
          <div className="stat-value">{runningServices.length}/{systemStatus.services.length}</div>
          <div className="stat-sub">Running</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Scenes</div>
          <div className="stat-value">0</div>
          <div className="stat-sub">No scenes active</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Now Playing</div>
          <div className="stat-value">—</div>
          <div className="stat-sub">No media playing</div>
        </div>
      </div>

      {/* ─── Services ─────────────────────────────────────────── */}
      <div className="hn-card" style={{ marginBottom: 24 }}>
        <h2 className="hn-card-title">Services</h2>
        {systemStatus.services.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="bi bi-plug" /></div>
            <p className="empty-state-title">No services detected</p>
            <p className="empty-state-desc">Connect to the HomeNest MCP backend to see service status.</p>
          </div>
        ) : (
          <div className="service-list">
            {systemStatus.services.map((svc, i) => (
              <div key={i} className="service-item">
                <div className="service-info">
                  <span className={`service-dot ${svc.status}`} />
                  <span className="service-name">{svc.name}</span>
                </div>
                <div className="service-meta">
                  {svc.uptime && <span className="service-uptime">{svc.uptime}</span>}
                  <span className={`hn-badge hn-badge-${svc.status}`}>{svc.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Quick Actions ────────────────────────────────────── */}
      <div className="hn-card">
        <h2 className="hn-card-title">Quick Actions</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="hn-btn hn-btn-primary"><i className="bi bi-play-fill" /> Play Media</button>
          <button className="hn-btn"><i className="bi bi-tv" /> Watch TV</button>
          <button className="hn-btn"><i className="bi bi-lightning-charge" /> Trigger Scene</button>
          <button className="hn-btn"><i className="bi bi-record-circle" /> Record</button>
        </div>
      </div>
    </div>
  )
}
