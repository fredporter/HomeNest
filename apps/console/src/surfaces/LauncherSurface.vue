<script setup lang="ts">
/**
 * Launcher Surface — main home screen with 4-tile navigation
 */
import { useRouter } from 'vue-router'
import { useMediaStore } from '@/stores/media'
import { onMounted } from 'vue'
import UIcon from '@/skills/atoms/UIcon.vue'

const router = useRouter()
const media = useMediaStore()

const tiles = [
  { id: 'media', icon: 'movie', label: 'Media Library', color: '#03A9F4', path: '/media', hint: 'Movies, TV, Music' },
  { id: 'tv', icon: 'live_tv', label: 'TV Guide', color: '#4CAF50', path: '/tv', hint: 'Live TV & DVR' },
  { id: 'automation', icon: 'bolt', label: 'Automation', color: '#FF9800', path: '/automation', hint: 'Scenes & Devices' },
  { id: 'settings', icon: 'settings', label: 'Settings', color: '#9C27B0', path: '/settings', hint: 'Network, Display, Audio' },
]

onMounted(() => {
  media.fetchLibrary()
})
</script>

<template>
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
</template>

<style scoped>
.hn-launcher {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--usx-grid-gap-lg);
  max-width: 900px;
  margin: var(--usx-spacing-2xl) auto;
}

@media (min-width: 1024px) {
  .hn-launcher {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>