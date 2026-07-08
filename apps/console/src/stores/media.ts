/**
 * Media store — Jellyfin library browse & playback.
 * Wired to uHomeNest API endpoints:
 *   GET  /api/library/media/     → fetchLibrary
 *   POST /api/playback/start     → play
 *   POST /api/playback/pause     → togglePlay (when pausing)
 *   POST /api/playback/resume    → togglePlay (when resuming)
 *   POST /api/playback/seek      → seek
 *   POST /api/playback/volume    → setVolume
 *   GET  /api/now-playing        → pollNowPlaying
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface MediaItem {
  id: string
  title: string
  type: 'movie' | 'tv' | 'music' | 'album'
  year?: number
  rating?: string
  poster?: string
  subtitle?: string
}

const API = 'http://localhost:7890'

export const useMediaStore = defineStore('media', () => {
  const items = ref<MediaItem[]>([])
  const categories = ref<{ id: string; label: string; count: number }[]>([])
  const loading = ref(false)

  const nowPlaying = ref<MediaItem | null>(null)
  const streamUrl = ref<string | null>(null)
  const isPlaying = ref(false)
  const progress = ref(0)   // 0–100
  const currentTime = ref('0:00')
  const duration = ref('0:00')
  const volume = ref(80)

  // ── library ──────────────────────────────────────────────

  async function fetchLibrary() {
    loading.value = true
    try {
      const res = await fetch(`${API}/api/library/media/`)
      const data = await res.json()
      items.value = data.items || []
      categories.value = data.categories || []
    } catch (e) {
      console.warn('Media fetch failed:', e)
    } finally {
      loading.value = false
    }
  }

  // ── playback control ─────────────────────────────────────

  async function play(item: MediaItem) {
    nowPlaying.value = item
    isPlaying.value = true
    progress.value = 0
    try {
      const res = await fetch(`${API}/api/playback/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId: item.id, target: 'console' }),
      })
      const data = await res.json()
      if (data.stream_url) {
        streamUrl.value = data.stream_url
      }
    } catch (e) {
      console.warn('Playback start failed:', e)
    }
  }

  async function togglePlay() {
    const next = !isPlaying.value
    isPlaying.value = next
    const endpoint = next ? 'resume' : 'pause'
    try {
      await fetch(`${API}/api/playback/${endpoint}`, { method: 'POST' })
    } catch (e) {
      console.warn(`Playback ${endpoint} failed:`, e)
    }
  }

  async function seek(pct: number) {
    progress.value = Math.max(0, Math.min(100, pct))
    try {
      await fetch(`${API}/api/playback/seek`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: pct }),
      })
    } catch (e) {
      console.warn('Playback seek failed:', e)
    }
  }

  async function setVolume(v: number) {
    volume.value = Math.max(0, Math.min(100, v))
    try {
      await fetch(`${API}/api/playback/volume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume: v }),
      })
    } catch (e) {
      console.warn('Volume set failed:', e)
    }
  }

  // ── state polling ────────────────────────────────────────

  async function pollNowPlaying() {
    try {
      const res = await fetch(`${API}/api/now-playing`)
      const data = await res.json()
      isPlaying.value = data.is_playing ?? false
      progress.value = data.progress ?? 0
      volume.value = data.volume ?? 80
    } catch {
      // server not running — silently ignore
    }
  }

  return {
    items, categories, loading,
    nowPlaying, streamUrl, isPlaying, progress, currentTime, duration, volume,
    fetchLibrary, play, togglePlay, seek, setVolume, pollNowPlaying,
  }
})