/**
 * Media store — Jellyfin library browse & playback
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

export const useMediaStore = defineStore('media', () => {
  const items = ref<MediaItem[]>([])
  const categories = ref<{ id: string; label: string; count: number }[]>([])
  const loading = ref(false)

  const nowPlaying = ref<MediaItem | null>(null)
  const isPlaying = ref(false)
  const progress = ref(0)   // 0–100
  const currentTime = ref('0:00')
  const duration = ref('0:00')
  const volume = ref(80)

  async function fetchLibrary() {
    loading.value = true
    try {
      const res = await fetch('/api/library/media/')
      const data = await res.json()
      items.value = data.items || []
      categories.value = data.categories || []
    } catch (e) {
      console.warn('Media fetch failed:', e)
    } finally {
      loading.value = false
    }
  }

  function play(item: MediaItem) {
    nowPlaying.value = item
    isPlaying.value = true
    progress.value = 0
  }

  function togglePlay() {
    isPlaying.value = !isPlaying.value
  }

  function seek(pct: number) {
    progress.value = Math.max(0, Math.min(100, pct))
  }

  function setVolume(v: number) {
    volume.value = Math.max(0, Math.min(100, v))
  }

  return {
    items, categories, loading,
    nowPlaying, isPlaying, progress, currentTime, duration, volume,
    fetchLibrary, play, togglePlay, seek, setVolume,
  }
})