<script setup lang="ts">
/**
 * Automation Surface — Home Assistant scenes, entities, and controls
 */
import { onMounted } from 'vue'
import { useAutomationStore } from '@/stores/automation'
import UIcon from '@/skills/atoms/UIcon.vue'

const auto = useAutomationStore()

onMounted(() => {
  auto.fetchStatus()
})
</script>

<template>
  <div class="surface">
    <div class="surface__header">
      <h1 class="surface__title">Automation</h1>
      <p class="surface__description">Home Assistant — devices, scenes, and automations</p>
    </div>

    <div class="surface__content">
      <!-- Loading -->
      <div v-if="auto.loading" class="usx-flex-center" style="padding: var(--usx-spacing-2xl)">
        <div style="width: 40px; height: 40px; border: 4px solid var(--usx-color-border); border-top-color: var(--usx-color-primary); border-radius: 50%; animation: spin 0.8s linear infinite"></div>
      </div>

      <!-- No connection -->
      <div v-else-if="!auto.scenes.length && !auto.entities.length" class="usx-card" style="text-align: center; padding: var(--usx-spacing-2xl)">
        <UIcon name="bolt" />
        <p style="color: var(--usx-color-on-surface-muted)">Home Assistant not connected.</p>
        <p style="font-size: var(--usx-font-size-sm); color: var(--usx-color-on-surface-muted)">
          Configure your HA bridge in Settings.
        </p>
      </div>

      <template v-else>
        <!-- Scenes -->
        <section>
          <h2 class="surface__panel-title">Scenes</h2>
          <div class="usx-grid">
            <button
              v-for="scene in auto.scenes"
              :key="scene.id"
              class="hn-launcher__tile"
              style="min-height: 120px; padding: var(--usx-spacing-md)"
              :class="{ 'hn-launcher__tile--focused': scene.active }"
              :style="{ borderColor: scene.active ? 'var(--usx-color-success)' : 'var(--usx-color-border)' }"
              @click="auto.activateScene(scene.id)"
            >
              <UIcon :name="scene.icon || 'stars'" />
              <div style="font-size: var(--usx-font-size-base); font-weight: var(--usx-font-weight-semibold)">{{ scene.name }}</div>
              <div v-if="scene.active" style="font-size: var(--usx-font-size-xs); color: var(--usx-color-success)">Active</div>
            </button>
          </div>
        </section>

        <!-- Entities -->
        <section>
          <h2 class="surface__panel-title">Devices</h2>
          <div class="usx-grid">
            <div
              v-for="entity in auto.entities"
              :key="entity.id"
              class="usx-card"
              @click="auto.toggleEntity(entity.id)"
              style="cursor: pointer"
            >
              <div class="usx-flex-row" style="justify-content: space-between">
                <div>
                  <div style="font-weight: var(--usx-font-weight-semibold)">{{ entity.name }}</div>
                  <div style="font-size: var(--usx-font-size-xs); color: var(--usx-color-on-surface-muted)">{{ entity.state }}</div>
                </div>
                <span class="usx-badge" :class="entity.state === 'on' || entity.state === 'playing' ? 'usx-badge--success' : ''">
                  <UIcon :name="entity.state === 'on' ? 'toggle_on' : 'toggle_off'" />
                  {{ entity.state }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>