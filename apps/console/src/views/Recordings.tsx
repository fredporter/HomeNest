/* ═══════════════════════════════════════════════════════════════════
   HomeNest Console — Recordings View
   List of recorded media with playback and management actions.
   ═══════════════════════════════════════════════════════════════════ */
import { useEffect } from 'react'
import { useHomenestStore } from '../stores/homenestStore'

export default function Recordings() {
  const { recordings, getRecordings, playMedia } = useHomenestStore()

  useEffect(() => {
    getRecordings()
  }, [getRecordings])

  return (
    <div className="content-area">
      {/* ─── Top Bar ──────────────────────────────────────────── */}
      <div className="top-bar">
        <h1 className="top-bar-title">Recordings</h1>
        <div className="top-bar-actions">
          <button className="hn-btn hn-btn-sm" onClick={getRecordings}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* ─── Recording List ───────────────────────────────────── */}
      <div className="hn-card">
        <h2 className="hn-card-title">All Recordings</h2>
        {recordings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="bi bi-camera-video" /></div>
            <p className="empty-state-title">No recordings</p>
            <p className="empty-state-desc">Record TV shows or media to see them here.</p>
          </div>
        ) : (
          <div className="recording-list">
            {recordings.map(rec => (
              <div key={rec.id} className="recording-item">
                <div className="recording-info">
                  <div className="recording-icon"><i className="bi bi-camera-video-fill" /></div>
                  <div>
                    <div className="recording-title">{rec.title}</div>
                    <div className="recording-meta">
                      {rec.channel} · {rec.date} · {rec.duration}
                    </div>
                  </div>
                </div>
                <div className="recording-actions">
                  <button className="hn-btn hn-btn-sm hn-btn-primary" onClick={() => playMedia(rec.id)}>
                    <i className="bi bi-play-fill" /> Play
                  </button>
                  <button className="hn-btn hn-btn-sm hn-btn-danger">
                    <i className="bi bi-trash" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
