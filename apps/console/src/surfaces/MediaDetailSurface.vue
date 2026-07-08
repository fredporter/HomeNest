<script setup lang="ts">
/**
 * Media Detail Surface — poster, metadata, overview, play/resume button.
 * Route: /media/:id
 */
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMediaStore, type MediaItem } from '@/stores/media'
import UIcon from '@/skills/atoms/UIcon.vue'

const route = useRoute()
const router = useRouter()
const media = useMediaStore()

const item = ref<MediaItem | null>(null)
const loading = ref(true)
const overview = ref('')
const genres = ref<string[]>([])
const streamUrl = ref<string | null>(null)

const API = 'http://localhost:7890'

onMounted(async () => {
  const id = route.params.id as string
  if (!id) {
    loading.value = false
    return
  }

  try {
    const res = await fetch(`${API}/api/library/media/${encodeURIComponent(id)}`)
    const data = await res.json()
    if (data.error) {
      loading.value = false
      return
    }
    item.value = {
      id: data.id,
      title: data.title,
      type: data.type,
      year: data.year,
      rating: data.rating,
      poster: data.poster,
      subtitle: data.subtitle,
    }
    overview.value = data.overview || ''
    genres.value = data.genres || []
    streamUrl.value = data.stream_url || null
  } catch (e) {
    console.warn('Media detail fetch failed:', e)
  } finally {
    loading.value = false
  }
})

function play() {
  if (item.value) {
    media.play(item.value)
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="surface">
    <div class="surface__header">
      <button class="usx-btn usx-btn--ghost" @click="goBack" style="margin-right: var(--usx-spacing-md)">
        <UIcon name="arrow_back" />
        Back
      </button>
      <div>
        <h1 class="surface__title">{{ item?.title ?? 'Loading...' }}</h1>
      </div>
    </div>

    <div class="surface__content">
      <!-- Loading -->
      <div v-if="loading" class="usx-flex-center" style="padding: var(--usx-spacing-2xl)">
        <div style="width: 40px; height: 40px; border: 4px solid var(--usx-color-border); border-top-color: var(--usx-color-primary); border-radius: 50%; animation: spin 0.8s linear infinite"></div>
      </div>

      <!-- Not found -->
      <div v-else-if="!item" class="usx-card" style="text-align: center; padding: var(--usx-spacing-2xl)">
        <UIcon name="error" />
        <p style="color: var(--usx-color-on-surface-muted)">Media item not found.</p>
      </div>

      <!-- Detail -->
      <template v-else>
        <div class="hn-detail-layout">
          <!-- Poster -->
          <div class="hn-detail-poster">
            <div v-if="item.poster" class="hn-poster-img">
              <img :src="item.poster" :alt="item.title" style="width: 100%; border-radius: var(--usx-radius-lg)" />
            </div>
            <div v-else class="hn-poster-placeholder">
              <UIcon name="movie" />
            </div>
          </div>

          <!-- Info -->
          <div class="hn-detail-info">
            <!-- Badges -->
            <div class="usx-flex-row usx-gap-sm" style="margin-bottom: var(--usx-spacing-md)">
              <span class="usx-badge usx-badge--primary">{{ item.type }}</span>
              <span v-if="item.year" class="usx-badge">{{ item.year }}</span>
              <span v-if="item.rating" class="usx-badge usx-badge--warning">{{ item.rating }}</span>
            </div>

            <!-- Overview -->
            <div v-if="overview" class="hn-detail-overview">
              <h3 class="hn-detail-section-title">Overview</h3>
              <p>{{ overview }}</p>
            </div>

            <!-- Genres -->
            <div v-if="genres.length" class="hn-detail-genres">
              <h3 class="hn-detail-section-title">Genres</h3>
              <div class="usx-flex-row usx-gap-sm">
                <span v-for="g in genres" :key="g" class="usx-badge usx-badge--outline">{{ g }}</span>
              </div>
            </div>

            <!-- Play button -->
            <button class="usx-btn usx-btn--primary hn-play-btn" @click="play">
              <UIcon name="play_arrow" />
              Play
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}

.hn-detail-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--usx-spacing-xl);
  max-width: 1000px;
}

@media (max-width: 768px) {
  .hn-detail-layout {
    grid-template-columns: 1fr;
  }
}

.hn-poster-placeholder {
  width: 100%;
  aspect-ratio: 2/3;
  background: var(--usx-color-surface-variant);
  border-radius: var(--usx-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  color: var(--usx-color-on-surface-muted);
}

.hn-detail-info {
  display: flex;
  flex-direction: column;
}

.hn-detail-overview {
  margin-bottom: var(--usx-spacing-lg);
}

.hn-detail-section-title {
  font-size: var(--usx-font-size-sm);
  font-weight: var(--usx-font-weight-semibold);
  color: var(--usx-color-on-surface-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 var(--usx-spacing-xs) 0;
}

.hn-detail-overview p {
  font-size: var(--usx-font-size-base);
  line-height: 1.6;
  color: var(--usx-color-on-surface);
  margin: 0;
}

.hn-detail-genres {
  margin-bottom: var(--usx-spacing-lg);
}

.hn-play-btn {
  margin-top: auto;
  padding: var(--usx-spacing-md) var(--usx-spacing-xl);
  font-size: var(--usx-font-size-lg);
  align-self: flex-start;
}
</style>