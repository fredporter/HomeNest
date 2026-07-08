<script setup lang="ts">
/**
 * Launcher Surface — main home screen with navigation tiles,
 * continue-watching row, clock, and system status indicators.
 */
import { onMounted, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMediaStore } from '@/stores/media'
import { useAutomationStore } from '@/stores/automation'
import { useSettingsStore } from '@/stores/settings'
import UIcon from '@/skills/atoms/UIcon.vue'

const router = useRouter()
const media = useMediaStore()
const auto = useAutomationStore()
const settings = useSettingsStore()

const clock = ref('')
let clockInterval: ReturnType<typeof setInterval> | null = null

const tiles = [
  { id: 'media', icon: 'movie', label: 'Media Library', color: '#03A9F4', path: '/media', hint: 'Movies, TV, Music' },
  { id: 'tv', icon: 'live_tv', label: 'TV Guide', color: '#4CAF50', path: '/tv', hint: 'Live TV & DVR' },
  { id: 'automation', icon: 'bolt', label: 'Automation', color: '#FF9800', path: '/automation', hint: 'Scenes & Devices' },
  { id: 'settings', icon: 'settings', label: 'Settings', color: '#9C27B0', path: '/settings', hint: 'Network, Display, Audio' },
]

function updateClock() {
  const now = new Date()
  clock.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  media.fetchLibrary()
  auto.fetchStatus()
  settings.fetchSettings()
  updateClock()
  clockInterval = setInterval(updateClock, 30_000)
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
})
</script>

<template>
  <div class="hn-launcher-shell">
    <!-- Status bar -->
    <div class="hn-launcher-status">
      <div class="usx-flex-row usx-gap-sm">
        <span v-if="settings.jellyfin.api_key_set" class="usx-badge usx-badge--success">
          <UIcon name="dns" /> Jellyfin
        </span>
        <span v-else class="usx-badge" style="opacity: 0.5">
          <UIcon name="dns" /> No Media
        </span>
        <span v-if="settings.homeAssistant.token_set" class="usx-badge usx-badge--success">
          <UIcon name="hub" /> HA
        </span>
        <span v-else class="usx-badge" style="opacity: 0.5">
          <UIcon name="hub" /> No HA
        </span>
      </div>
      <div class="hn-launcher-clock">
        <UIcon name="schedule" />
        {{ clock }}
      </div>
    </div>

    <!-- Tiles -->
    <div class="hn-launcher">
      <button
        v-for="tile in tiles"
        :key="tile.id"
        class="hn-launcher__tile"
        @click="router.push(tile.path)"
        :style="{ borderColor: tile.color + '44' }"
      >
        <div class="hn-launcher__tile-icon" :style="{ color: tile.color }">
          <UIcon :name="tile.icon" />
        </div>
        <div class="hn-launcher__tile-label">{{ tile.label }}</div>
        <div style="font-size: var(--usx-font-size-xs); color: var(--usx-color-on-surface-muted)">
          {{ tile.hint }}
        </div>
      </button>
    </div>

    <!-- Continue Watching -->
    <div v-if="media.nowPlaying" class="hn-continue-watching">
      <h2 class="surface__panel-title">Now Playing</h2>
      <div class="usx-card" style="cursor: pointer" @click="router.push('/now-playing')">
        <div class="usx-flex-row" style="gap: var(--usx-spacing-md); align-items: center">
          <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: var(--usx-radius-md); background: var(--usx-color-surface-variant)">
            <UIcon name="play_circle" />
          </div>
          <div>
            <div style="font-weight: var(--usx-font-weight-semibold)">{{ media.nowPlaying.title }}</div>
            <div style="font-size: var(--usx-font-size-xs); color: var(--usx-color-on-surface-muted)">
              {{ media.isPlaying ? 'Playing' : 'Paused' }} · {{ media.progress.toFixed(0) }}%
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hn-launcher-shell {
  max-width: 900px;
  margin: 0 auto;
  padding-top: var(--usx-spacing-md);
}

.hn-launcher {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--usx-grid-gap-lg);
  margin: var(--usx-spacing-lg) 0 var(--usx-spacing-2xl) 0;
}

.hn-launcher-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--usx-spacing-sm) 0;
}

.hn-launcher-clock {
  font-size: var(--usx-font-size-lg);
  font-weight: var(--usx-font-weight-semibold);
  color: var(--usx-color-on-surface);
  display: flex;
  align-items: center;
  gap: var(--usx-spacing-xs);
}

.hn-continue-watching {
  margin-bottom: var(--usx-spacing-2xl);
}

@media (min-width: 1024px) {
  .hn-launcher {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>