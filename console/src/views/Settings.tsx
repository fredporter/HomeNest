/* ═══════════════════════════════════════════════════════════════════
   HomeNest Console — Settings View
   System configuration, connection info, and preferences.
   ═══════════════════════════════════════════════════════════════════ */
import { useHomenestStore } from '../stores/homenestStore'

export default function Settings() {
  const { systemStatus } = useHomenestStore()

  return (
    <div className="content-area">
      {/* ─── Top Bar ──────────────────────────────────────────── */}
      <div className="top-bar">
        <h1 className="top-bar-title">Settings</h1>
      </div>

      {/* ─── System Info ──────────────────────────────────────── */}
      <div className="hn-card" style={{ marginBottom: 24 }}>
        <h2 className="hn-card-title">System</h2>
        <div className="settings-section">
          <div className="settings-row">
            <span className="settings-label">Version</span>
            <span className="settings-value">{systemStatus.version}</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Uptime</span>
            <span className="settings-value">{systemStatus.uptime}</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">MCP Endpoint</span>
            <span className="settings-value">http://localhost:8080</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">USX Endpoint</span>
            <span className="settings-value">http://localhost:7890</span>
          </div>
        </div>
      </div>

      {/* ─── Display ──────────────────────────────────────────── */}
      <div className="hn-card" style={{ marginBottom: 24 }}>
        <h2 className="hn-card-title">Display</h2>
        <div className="settings-section">
          <div className="settings-row">
            <span className="settings-label">Theme</span>
            <span className="settings-value">GitHub Dark</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Font</span>
            <span className="settings-value">Inter</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Viewport</span>
            <span className="settings-value">{window.innerWidth}×{window.innerHeight}</span>
          </div>
        </div>
      </div>

      {/* ─── Device ───────────────────────────────────────────── */}
      <div className="hn-card">
        <h2 className="hn-card-title">Device</h2>
        <div className="settings-section">
          <div className="settings-row">
            <span className="settings-label">Input Mode</span>
            <span className="settings-value">Mouse / Touch</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Touch Target</span>
            <span className="settings-value">{getComputedStyle(document.documentElement).getPropertyValue('--hn-touch-target').trim() || '48px'}</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Font Size</span>
            <span className="settings-value">{getComputedStyle(document.documentElement).getPropertyValue('--hn-font-size').trim() || '16px'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
