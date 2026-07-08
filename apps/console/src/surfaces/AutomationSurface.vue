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
</write_to_file>
<write_to_file>
<path>/Users/fredbook/Code/HomeNest/apps/console/src/surfaces/SettingsSurface.vue</path>
<content>
<script setup lang="ts">
/**
 * Settings Surface — network, display, audio, system configuration
 */
import UIcon from '@/skills/atoms/UIcon.vue'

const settingsSections = [
  {
    id: 'network',
    icon: 'wifi',
    title: 'Network',
    desc: 'LAN: 192.168.1.42 · Connected',
  },
  {
    id: 'display',
    icon: 'desktop_windows',
    title: 'Display',
    desc: '1080p @ 60Hz · HDMI-1',
  },
  {
    id: 'audio',
    icon: 'volume_up',
    title: 'Audio',
    desc: 'HDMI Output · Stereo',
  },
  {
    id: 'media',
    icon: 'dns',
    title: 'Media Server',
    desc: 'Jellyfin: Connected · localhost:8096',
  },
  {
    id: 'automation',
    icon: 'hub',
    title: 'Home Assistant Bridge',
    desc: 'Connected · localhost:8123',
  },
  {
    id: 'system',
    icon: 'info',
    title: 'System',
    desc: 'HomeNest v0.1.0 · Linux',
  },
]
</script>

<template>
  <div class="surface">
    <div class="surface__header">
      <h1 class="surface__title">Settings</h1>
      <p class="surface__description">System configuration</p>
    </div>

    <div class="surface__content">
      <div class="usx-grid">
        <div
          v-for="section in settingsSections"
          :key="section.id"
          class="usx-card"
        >
          <div class="usx-flex-row" style="gap: var(--usx-spacing-md)">
            <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: var(--usx-radius-md); background: var(--usx-color-surface-variant)">
              <UIcon :name="section.icon" />
            </div>
            <div>
              <div style="font-weight: var(--usx-font-weight-semibold); font-size: var(--usx-font-size-lg)">{{ section.title }}</div>
              <div style="font-size: var(--usx-font-size-sm); color: var(--usx-color-on-surface-muted)">{{ section.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
</write_to_file>