/**
 * Automation store — Home Assistant entity state & scenes.
 * Wired to uHomeNest API endpoints:
 *   GET  /api/ha/status                  → fetchStatus
 *   POST /api/ha/scenes/:id/activate     → activateScene
 *   POST /api/ha/entities/:id/toggle     → toggleEntity
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface HAScene {
  id: string
  name: string
  icon: string
  active: boolean
}

export interface HAEntity {
  id: string
  name: string
  state: string
  type: 'light' | 'switch' | 'sensor' | 'climate' | 'lock' | 'media_player'
}

const API = 'http://localhost:7890'

export const useAutomationStore = defineStore('automation', () => {
  const scenes = ref<HAScene[]>([])
  const entities = ref<HAEntity[]>([])
  const loading = ref(false)
  const haOnline = ref(false)

  async function fetchStatus() {
    loading.value = true
    try {
      const res = await fetch(`${API}/api/ha/status`)
      const data = await res.json()
      scenes.value = data.scenes || []
      entities.value = data.entities || []
      haOnline.value = data.ha_online || false
    } catch (e) {
      console.warn('Automation fetch failed:', e)
    } finally {
      loading.value = false
    }
  }

  async function activateScene(sceneId: string) {
    try {
      const res = await fetch(
        `${API}/api/ha/scenes/${encodeURIComponent(sceneId)}/activate`,
        { method: 'POST' },
      )
      const data = await res.json()
      if (data.error) {
        console.warn('Scene activation failed:', data.error)
        return
      }
      scenes.value = scenes.value.map((s) =>
        s.id === sceneId ? { ...s, active: true } : { ...s, active: false },
      )
    } catch (e) {
      console.warn('Scene activation failed:', e)
    }
  }

  async function toggleEntity(entityId: string) {
    try {
      const res = await fetch(
        `${API}/api/ha/entities/${encodeURIComponent(entityId)}/toggle`,
        { method: 'POST' },
      )
      const data = await res.json()
      if (data.error) {
        console.warn('Entity toggle failed:', data.error)
        return
      }
      // Optimistically toggle state; re-fetch on next poll
      entities.value = entities.value.map((e) =>
        e.id === entityId
          ? { ...e, state: e.state === 'on' ? 'off' : 'on' }
          : e,
      )
    } catch (e) {
      console.warn('Entity toggle failed:', e)
    }
  }

  return {
    scenes, entities, loading, haOnline,
    fetchStatus, activateScene, toggleEntity,
  }
})