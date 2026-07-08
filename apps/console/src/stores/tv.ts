/**
 * TV Guide store — Live TV channels + EPG schedule.
 * Wired to:
 *   GET /api/tv/guide → fetchGuide
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TVChannel {
  id: string
  name: string
  number: string
  image_url?: string | null
  channel_type: string
}

export interface TVProgramme {
  id: string
  title: string
  start_time: string
  end_time: string
  time: string
  overview: string
  is_live: boolean
  channel_id: string
}

const API = 'http://localhost:7890'

export const useTVStore = defineStore('tv', () => {
  const channels = ref<TVChannel[]>([])
  const schedules = ref<Record<string, TVProgramme[]>>({})
  const loading = ref(false)
  const liveOnline = ref(false)

  async function fetchGuide() {
    loading.value = true
    try {
      const res = await fetch(`${API}/api/tv/guide`)
      const data = await res.json()
      channels.value = data.channels || []
      schedules.value = data.schedules || {}
      liveOnline.value = data.jellyfin_online || false
    } catch (e) {
      console.warn('TV guide fetch failed:', e)
    } finally {
      loading.value = false
    }
  }

  function getProgrammesForChannel(channelId: string): TVProgramme[] {
    return schedules.value[channelId] || []
  }

  return {
    channels, schedules, loading, liveOnline,
    fetchGuide, getProgrammesForChannel,
  }
})