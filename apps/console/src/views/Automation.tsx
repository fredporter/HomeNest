/* ═══════════════════════════════════════════════════════════════════
   HomeNest Console — Automation View
   Scene triggers, recent actions, and automation status.
   ═══════════════════════════════════════════════════════════════════ */
import { useEffect } from 'react'
import { useHomenestStore } from '../stores/homenestStore'

const SCENE_DESCRIPTIONS: Record<string, string> = {
  goodnight: 'Lights off, doors locked, media paused',
  morning: 'Lights on, blinds open, morning briefing',
  away: 'Lights off, HVAC eco, security armed',
}

export default function Automation() {
  const { activeScenes, recentActions, availableScenes, triggerScene, getAutomationStatus } = useHomenestStore()

  useEffect(() => {
    getAutomationStatus()
  }, [getAutomationStatus])

  return (
    <div className="content-area">
      {/* ─── Top Bar ──────────────────────────────────────────── */}
      <div className="top-bar">
        <h1 className="top-bar-title">Automation</h1>
        <div className="top-bar-actions">
          <button className="hn-btn hn-btn-sm" onClick={getAutomationStatus}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* ─── Scenes ───────────────────────────────────────────── */}
      <div className="hn-card" style={{ marginBottom: 24 }}>
        <h2 className="hn-card-title">Scenes</h2>
        <div className="scene-grid">
          {availableScenes.map(scene => (
            <button
              key={scene}
              className={`scene-card ${activeScenes.includes(scene) ? 'active' : ''}`}
              onClick={() => triggerScene(scene)}
            >
              <div className="scene-card-title">{scene}</div>
              <div className="scene-card-desc">
                {SCENE_DESCRIPTIONS[scene] || 'Trigger automation scene'}
              </div>
              {activeScenes.includes(scene) && (
                <span className="hn-badge hn-badge-active">Active</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Recent Actions ───────────────────────────────────── */}
      <div className="hn-card">
        <h2 className="hn-card-title">Recent Actions</h2>
        {recentActions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="bi bi-lightning-charge" /></div>
            <p className="empty-state-title">No recent actions</p>
            <p className="empty-state-desc">Trigger a scene or play media to see actions here.</p>
          </div>
        ) : (
          <div className="service-list">
            {recentActions.map((action, i) => (
              <div key={i} className="service-item">
                <div className="service-info">
                  <span style={{ fontSize: 18 }}><i className="bi bi-lightning-charge-fill" /></span>
                  <div>
                    <div className="service-name">{action.action}</div>
                    {action.description && (
                      <div style={{ fontSize: 12, color: 'var(--gh-text-secondary)' }}>
                        {action.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="service-meta">
                  {action.timestamp && (
                    <span className="service-uptime">{action.timestamp}</span>
                  )}
                  {action.status && (
                    <span className={`hn-badge hn-badge-${action.status === 'completed' ? 'running' : 'stopped'}`}>
                      {action.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
