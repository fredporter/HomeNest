/**
 * Automation store — Home Assistant entity state & scenes
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

export const useAutomationStore = defineStore('automation', () => {
  const scenes = ref<HAScene[]>([])
  const entities = ref<HAEntity[]>([])
  const loading = ref(false)

  async function fetchStatus() {
    loading.value = true
    try {
      const res = await fetch('/api/ha/status')
      const data = await res.json()
      scenes.value = data.scenes || []
      entities.value = data.entities || []
    } catch (e) {
      console.warn('Automation fetch failed:', e)
    } finally {
      loading.value = false
    }
  }

  async function activateScene(sceneId: string) {
    try {
      await fetch(`/api/ha/scenes/${sceneId}/activate`, { method: 'POST' })
      scenes.value = scenes.value.map(s =>
        s.id === sceneId ? { ...s, active: true } : { ...s, active: false }
      )
    } catch (e) {
      console.warn('Scene activation failed:', e)
    }
  }

  async function toggleEntity(entityId: string) {
    try {
      await fetch(`/api/ha/entities/${entityId}/toggle`, { method: 'POST' })
    } catch (e) {
      console.warn('Entity toggle failed:', e)
    }
  }

  return { scenes, entities, loading, fetchStatus, activateScene, toggleEntity }
})