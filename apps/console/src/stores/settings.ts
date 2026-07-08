/**
 * Settings store — server configuration for Jellyfin & HA connections.
 * Wired to:
 *   GET  /api/settings  → fetchSettings
 *   POST /api/settings  → saveSettings
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

const API = 'http://localhost:7890'

export interface JellyfinSettings {
  url: string
  api_key_set: boolean
  api_key_preview: string
}

export interface HASettings {
  url: string
  token_set: boolean
  token_preview: string
}

export const useSettingsStore = defineStore('settings', () => {
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  const jellyfin = ref<JellyfinSettings>({
    url: 'http://localhost:8096',
    api_key_set: false,
    api_key_preview: '',
  })

  const homeAssistant = ref<HASettings>({
    url: 'http://localhost:8123',
    token_set: false,
    token_preview: '',
  })

  const envFileExists = ref(false)

  async function fetchSettings() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API}/api/settings`)
      const data = await res.json()
      jellyfin.value = data.jellyfin || jellyfin.value
      homeAssistant.value = data.home_assistant || homeAssistant.value
      envFileExists.value = data.env_file_exists || false
    } catch (e) {
      error.value = 'Failed to load settings'
      console.warn('Settings fetch failed:', e)
    } finally {
      loading.value = false
    }
  }

  async function saveConnection(
    service: 'jellyfin' | 'home_assistant',
    url: string,
    keyOrToken: string,
  ) {
    saving.value = true
    error.value = null
    success.value = null

    const body: Record<string, Record<string, string>> = {}

    if (service === 'jellyfin') {
      body.jellyfin = { url, api_key: keyOrToken }
    } else {
      body.home_assistant = { url, token: keyOrToken }
    }

    try {
      const res = await fetch(`${API}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (data.error) {
        error.value = data.error
        return
      }

      // Update local state from response
      if (data.settings?.jellyfin) {
        jellyfin.value = data.settings.jellyfin
      }
      if (data.settings?.home_assistant) {
        homeAssistant.value = data.settings.home_assistant
      }
      success.value = `${service === 'jellyfin' ? 'Jellyfin' : 'Home Assistant'} connected successfully`
    } catch (e) {
      error.value = 'Failed to save settings'
      console.warn('Settings save failed:', e)
    } finally {
      saving.value = false
    }
  }

  function clearMessages() {
    error.value = null
    success.value = null
  }

  return {
    loading, saving, error, success,
    jellyfin, homeAssistant, envFileExists,
    fetchSettings, saveConnection, clearMessages,
  }
})