<script setup lang="ts">
/**
 * HomeNest Console — App Shell
 * 10-foot display with topbar, viewport, now-playing bar, and button hints overlay
 */
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNavigationStore } from '@/stores/navigation'
import { useMediaStore } from '@/stores/media'
import { useController } from '@/input/useController'

const router = useRouter()
const nav = useNavigationStore()
const media = useMediaStore()
const { gamepadActive, handleGamepadInput } = useController()

function navigate(path: string) {
  nav.push(path)
  router.push(path)
}

onMounted(() => {
  media.fetchLibrary()
})

// Global keyboard shortcuts (10-foot dpad emulation)
function onKeydown(e: KeyboardEvent) {
  // Only handle if no input/textarea focused
  if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return

  switch (e.key) {
    case 'Escape':
    case 'Backspace': {
      const back = nav.pop()
      router.push(back)
      break
    }
    case 'h': navigate('/'); break
    case 'm': navigate('/media'); break
    case 't': navigate('/tv'); break
    case 'p': media.togglePlay(); break
    case 'a': navigate('/automation'); break
    case 's': navigate('/settings'); break
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="hn-console" @gamepadinput="handleGamepadInput">
    <!-- Topbar -->
    <header class="hn-console__topbar usx-topbar">
      <div class="usx-flex-row usx-gap-sm">
        <span class="material-symbols-outlined" style="color: var(--usx-color-primary)">nest_eco_leaf</span>
        <span style="font-size: var(--usx-font-size-xl); font-weight: var(--usx-font-weight-bold)">HomeNest</span>
      </div>

      <nav class="usx-tabs" aria-label="Surface navigation">
        <button
          v-for="route in [
            { path: '/', icon: 'home', label: 'Home' },
            { path: '/media', icon: 'movie', label: 'Media' },
            { path: '/tv', icon: 'live_tv', label: 'TV' },
            { path: '/automation', icon: 'bolt', label: 'Auto' },
            { path: '/settings', icon: 'settings', label: 'Settings' },
          ]"
          :key="route.path"
          class="usx-tab"
          :class="{ 'usx-tab--active': $route.path === route.path }"
          @click="navigate(route.path)"
        >
          <span class="material-symbols-outlined">{{ route.icon }}</span>
          <span>{{ route.label }}</span>
        </button>
      </nav>
    </header>

    <!-- Viewport -->
    <main class="hn-console__viewport">
      <router-view />
    </main>

    <!-- Now-Playing Bar -->
    <div
      class="hn-now-playing"
      :class="{ 'hn-now-playing--idle': !media.nowPlaying }"
    >
      <!-- Artwork -->
      <div class="hn-now-playing__artwork">
        <span class="material-symbols-outlined">
          {{ media.nowPlaying ? 'album' : 'music_note' }}
        </span>
      </div>

      <!-- Info -->
      <div class="hn-now-playing__info">
        <div class="hn-now-playing__title">
          {{ media.nowPlaying?.title ?? 'Nothing playing' }}
        </div>
        <div class="hn-now-playing__artist" v-if="media.nowPlaying">
          {{ media.nowPlaying.subtitle ?? '' }}
        </div>
      </div>

      <!-- Transport -->
      <div class="hn-transport">
        <button class="hn-transport__btn" title="Previous">
          <span class="material-symbols-outlined">skip_previous</span>
        </button>
        <button class="hn-transport__btn hn-transport__btn--play" @click="media.togglePlay()">
          <span class="material-symbols-outlined">
            {{ media.isPlaying ? 'pause' : 'play_arrow' }}
          </span>
        </button>
        <button class="hn-transport__btn" title="Next">
          <span class="material-symbols-outlined">skip_next</span>
        </button>
      </div>

      <!-- Seek -->
      <div class="hn-seek">
        <div class="hn-seek__bar">
          <div class="hn-seek__progress" :style="{ width: media.progress + '%' }"></div>
        </div>
        <div class="hn-seek__time">
          <span>{{ media.currentTime }}</span>
          <span>{{ media.duration }}</span>
        </div>
      </div>

      <!-- Volume -->
      <div class="hn-volume">
        <button class="hn-volume__btn" title="Mute">
          <span class="material-symbols-outlined">volume_up</span>
        </button>
        <input
          type="range"
          class="hn-volume__slider"
          :value="media.volume"
          @input="media.setVolume(Number(($event.target as HTMLInputElement).value))"
          min="0"
          max="100"
          aria-label="Volume"
        />
      </div>
    </div>

    <!-- Controller button hints -->
    <div v-if="nav.showButtonHints" class="hn-button-hints">
      <div class="hn-button-hint">
        <div class="hn-button-hint__key hn-button-hint__key--a">A</div>
        <div class="hn-button-hint__label">Select</div>
      </div>
      <div class="hn-button-hint">
        <div class="hn-button-hint__key hn-button-hint__key--b">B</div>
        <div class="hn-button-hint__label">Back</div>
      </div>
      <div class="hn-button-hint">
        <div class="hn-button-hint__key hn-button-hint__key--x">X</div>
        <div class="hn-button-hint__label">Info</div>
      </div>
      <div class="hn-button-hint">
        <div class="hn-button-hint__key hn-button-hint__key--y">Y</div>
        <div class="hn-button-hint__label">Menu</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hn-console__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--usx-spacing-lg);
  min-height: var(--usx-topbar-height);
}
</style>