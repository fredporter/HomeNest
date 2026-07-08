<script setup lang="ts">
/**
 * Media Browser Surface — poster wall + category tabs
 */
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMediaStore, type MediaItem } from '@/stores/media'
import UIcon from '@/skills/atoms/UIcon.vue'

const router = useRouter()
const media = useMediaStore()

const activeCategory = computed(() => 'all')

function filteredItems(): MediaItem[] {
  return media.items
}

onMounted(() => {
  media.fetchLibrary()
})

function openDetail(item: MediaItem) {
  router.push(`/media/${encodeURIComponent(item.id)}`)
}
</script>

<template>
  <div>
    <div class="surface__header">
      <h1 class="surface__title">Media Library</h1>
      <p class="surface__description" v-if="media.categories.length">
        {{ media.categories.map(c => `${c.label} (${c.count})`).join(' · ') }}
      </p>
      <p class="surface__description" v-else>
        Connected to Jellyfin · Browse your library
      </p>
    </div>

    <!-- Category Tabs -->
    <div class="usx-tabs" v-if="media.categories.length">
      <button
        v-for="cat in [{ id: 'all', label: 'All' }, ...media.categories]"
        :key="cat.id"
        class="usx-tab"
        :class="{ 'usx-tab--active': activeCategory === cat.id }"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="media.loading" class="usx-flex-center" style="padding: var(--usx-spacing-2xl)">
      <div class="spinner" style="width: 40px; height: 40px; border: 4px solid var(--usx-color-border); border-top-color: var(--usx-color-primary); border-radius: 50%; animation: spin 0.8s linear infinite"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="!filteredItems().length" class="usx-flex-center" style="padding: var(--usx-spacing-2xl); color: var(--usx-color-on-surface-muted)">
      <div style="text-align: center">
        <UIcon name="movie" />
        <p>No media found. Add content to your Jellyfin library.</p>
      </div>
    </div>

    <!-- Poster Wall -->
    <div v-else class="hn-poster-wall" style="padding: var(--usx-spacing-lg) 0">
      <button
        v-for="item in filteredItems()"
        :key="item.id"
        class="hn-poster-card"
        @click="openDetail(item)"
      >
        <div class="hn-poster-card__image">
          <UIcon :name="item.type === 'movie' ? 'movie' : item.type === 'tv' ? 'tv' : 'music_note'" />
        </div>
        <div class="hn-poster-card__meta">
          <div class="hn-poster-card__title">{{ item.title }}</div>
          <div class="hn-poster-card__subtitle" v-if="item.year">{{ item.year }} · {{ item.rating ?? 'NR' }}</div>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>