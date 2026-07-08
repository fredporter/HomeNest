<script setup lang="ts">
/**
 * Now Playing Surface — media controls, artwork display, info panel
 */
import { useMediaStore } from '@/stores/media'
import { useRouter } from 'vue-router'
import UIcon from '@/skills/atoms/UIcon.vue'

const media = useMediaStore()
const router = useRouter()
</script>

<template>
  <div class="surface">
    <div class="surface__header">
      <h1 class="surface__title">Now Playing</h1>
      <p class="surface__description" v-if="media.nowPlaying">
        {{ media.nowPlaying.type === 'movie' ? 'Movie' : media.nowPlaying.type === 'tv' ? 'TV Show' : 'Music' }}
      </p>
    </div>

    <div class="surface__content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--usx-spacing-xl); min-height: 60vh">
      <!-- Artwork -->
      <div style="width: 320px; height: 320px; border-radius: var(--usx-radius-2xl); background: var(--usx-color-surface-variant); display: flex; align-items: center; justify-content: center">
        <UIcon :name="media.nowPlaying ? 'album' : 'music_note'" />
      </div>

      <!-- Title -->
      <h2 style="font-size: var(--usx-font-size-3xl); text-align: center">
        {{ media.nowPlaying?.title ?? 'Nothing playing' }}
      </h2>
      <p v-if="media.nowPlaying?.subtitle" style="font-size: var(--usx-font-size-lg); color: var(--usx-color-on-surface-muted)">
        {{ media.nowPlaying.subtitle }}
      </p>

      <!-- Progress bar -->
      <div class="hn-seek" style="max-width: 640px; width: 100%">
        <div class="hn-seek__bar" style="height: 12px">
          <div class="hn-seek__progress" :style="{ width: media.progress + '%' }"></div>
        </div>
        <div class="hn-seek__time">
          <span>{{ media.currentTime }}</span>
          <span>{{ media.duration }}</span>
        </div>
      </div>

      <!-- Transport controls -->
      <div class="hn-transport" style="gap: var(--usx-spacing-lg)">
        <button class="hn-transport__btn"><UIcon name="skip_previous" /></button>
        <button class="hn-transport__btn hn-transport__btn--play" @click="media.togglePlay()" style="width: 96px; height: 96px; font-size: 40px">
          <UIcon :name="media.isPlaying ? 'pause' : 'play_arrow'" />
        </button>
        <button class="hn-transport__btn"><UIcon name="skip_next" /></button>
      </div>
    </div>

    <div class="surface__footer" style="text-align: center">
      <button class="usx-button" @click="router.push('/media')" style="font-size: var(--usx-font-size-base)">
        <UIcon name="arrow_back" /> Back to Library
      </button>
    </div>
  </div>
</template>