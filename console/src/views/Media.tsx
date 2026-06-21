/* ═══════════════════════════════════════════════════════════════════
   HomeNest Console — Media View
   Now playing bar, media library browser, and transport controls.
   Device-ready: large touch targets, 10-foot view optimized.
   ═══════════════════════════════════════════════════════════════════ */
import { useEffect } from 'react'
import { useHomenestStore } from '../stores/homenestStore'

export default function Media() {
  const {
    nowPlaying, mediaList, isPlaying,
    listMedia, playMedia, pauseMedia, resumeMedia, stopMedia,
  } = useHomenestStore()

  useEffect(() => {
    listMedia()
  }, [listMedia])

  return (
    <div className="content-area">
      {/* ─── Top Bar ──────────────────────────────────────────── */}
      <div className="top-bar">
        <h1 className="top-bar-title">Media</h1>
        <div className="top-bar-actions">
          <button className="hn-btn hn-btn-sm" onClick={() => listMedia()}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* ─── Now Playing ──────────────────────────────────────── */}
      {nowPlaying ? (
        <div className="now-playing-bar">
          <div className="now-playing-info">
            <div className="now-playing-icon"><i className="bi bi-music-note-beamed" /></div>
            <div>
              <div className="now-playing-title">{nowPlaying.title}</div>
              <div className="now-playing-label">
                {isPlaying ? <><i className="bi bi-play-fill" /> Playing</> : <><i className="bi bi-pause-fill" /> Paused</>}
              </div>
            </div>
          </div>
          <div className="now-playing-controls">
            {isPlaying ? (
              <button className="hn-btn" onClick={pauseMedia}><i className="bi bi-pause-fill" /> Pause</button>
            ) : (
              <button className="hn-btn hn-btn-primary" onClick={resumeMedia}><i className="bi bi-play-fill" /> Resume</button>
            )}
            <button className="hn-btn hn-btn-danger" onClick={stopMedia}><i className="bi bi-stop-fill" /> Stop</button>
          </div>
        </div>
      ) : (
        <div className="now-playing-bar" style={{ opacity: 0.5 }}>
          <div className="now-playing-info">
            <div className="now-playing-icon"><i className="bi bi-music-note-beamed" /></div>
            <div>
              <div className="now-playing-title">Nothing Playing</div>
              <div className="now-playing-label">Select media to start</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Media Library ────────────────────────────────────── */}
      <div className="hn-card">
        <h2 className="hn-card-title">Media Library</h2>
        {mediaList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="bi bi-film" /></div>
            <p className="empty-state-title">No media found</p>
            <p className="empty-state-desc">Add media to your library or connect to a media server.</p>
          </div>
        ) : (
          <div className="media-grid">
            {mediaList.map(item => (
              <button
                key={item.id}
                className="media-item"
                onClick={() => playMedia(item.id)}
              >
                <div className="media-item-icon">
                  <i className={`bi ${item.media_type === 'video' ? 'bi-film' : 'bi-music-note-beamed'}`} />
                </div>
                <div className="media-item-title">{item.title}</div>
                <div className="media-item-type">{item.media_type}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
