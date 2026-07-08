/* ═══════════════════════════════════════════════════════════════════
   HomeNest Console — TV Guide View
   Channel list with EPG data, live channel tuning.
   ═══════════════════════════════════════════════════════════════════ */
import { useEffect } from 'react'
import { useHomenestStore } from '../stores/homenestStore'

export default function TvEpg() {
  const { epgChannels, liveChannel, getEpg, tuneChannel } = useHomenestStore()

  useEffect(() => {
    getEpg()
  }, [getEpg])

  return (
    <div className="content-area">
      {/* ─── Top Bar ──────────────────────────────────────────── */}
      <div className="top-bar">
        <h1 className="top-bar-title">TV Guide</h1>
        <div className="top-bar-actions">
          {liveChannel && (
            <span className="hn-badge hn-badge-active">
              <i className="bi bi-tv" /> Watching: {liveChannel}
            </span>
          )}
          <button className="hn-btn hn-btn-sm" onClick={() => getEpg()}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* ─── Channel List ─────────────────────────────────────── */}
      <div className="hn-card">
        <h2 className="hn-card-title">Channels</h2>
        {epgChannels.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="bi bi-tv" /></div>
            <p className="empty-state-title">No channels available</p>
            <p className="empty-state-desc">Connect to a TV tuner or EPG source to see channels.</p>
          </div>
        ) : (
          <div className="channel-list">
            {epgChannels.map(ch => (
              <button
                key={ch.id}
                className={`channel-item ${liveChannel === ch.id ? 'active' : ''}`}
                onClick={() => tuneChannel(liveChannel === ch.id ? null : ch.id)}
              >
                <div className="channel-info">
                  <span className="channel-number">{ch.number}</span>
                  <div>
                    <div className="channel-name">{ch.name}</div>
                    {ch.current && (
                      <div className="channel-current">
                        {ch.current.title} · {ch.current.time}
                      </div>
                    )}
                  </div>
                </div>
                {liveChannel === ch.id && (
                  <span className="hn-badge hn-badge-active">Live</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
