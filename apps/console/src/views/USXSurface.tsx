/* ═══════════════════════════════════════════════════════════════════
   HomeNest Console — USX Surface View
   Renders UDO/UDX dual-mode surfaces from the USX schema.
   Placeholder — will import UDORenderer/UDXRenderer from ui/usxd/.
   ═══════════════════════════════════════════════════════════════════ */
import { useState } from 'react'

export default function USXSurface() {
  const [surfaceId, setSurfaceId] = useState('')

  return (
    <div className="content-area">
      {/* ─── Top Bar ──────────────────────────────────────────── */}
      <div className="top-bar">
        <h1 className="top-bar-title">USX Surface</h1>
        <div className="top-bar-actions">
          <input
            className="hn-input"
            type="text"
            placeholder="Surface ID (e.g., dashboard)"
            value={surfaceId}
            onChange={e => setSurfaceId(e.target.value)}
            style={{ width: 240 }}
          />
          <button className="hn-btn hn-btn-primary"><i className="bi bi-download" /> Load Surface</button>
        </div>
      </div>

      {/* ─── Surface Container ────────────────────────────────── */}
      <div className="hn-card">
        <h2 className="hn-card-title">Surface Renderer</h2>
        <div className="usx-surface-container">
          {!surfaceId ? (
            <div className="empty-state">
              <div className="empty-state-icon"><i className="bi bi-grid-3x3-gap" /></div>
              <p className="empty-state-title">Enter a Surface ID</p>
              <p className="empty-state-desc">
                Type a surface ID above and click "Load Surface" to render a UDO or UDX surface.
                <br />
                <small style={{ color: 'var(--gh-text-muted)' }}>
                  Available: dashboard, media-player, automation, tv-guide
                </small>
              </p>
            </div>
          ) : (
            <div className="loading-state">
              <div className="loading-spinner" />
              <span>Loading surface: {surfaceId}...</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── USX Schema Info ──────────────────────────────────── */}
      <div className="hn-card" style={{ marginTop: 24 }}>
        <h2 className="hn-card-title">About USX</h2>
        <p style={{ color: 'var(--gh-text-secondary)', lineHeight: 1.6, margin: 0 }}>
          USX (Universal Surface eXchange) is a dual-mode schema for rendering
          interactive surfaces. <strong>UDO</strong> (Universal Document Object) defines
          structured content with blocks, while <strong>UDX</strong> (Universal Device eXchange)
          defines device-oriented control panels. The renderer auto-detects the mode
          from the schema and renders accordingly.
        </p>
      </div>
    </div>
  )
}
