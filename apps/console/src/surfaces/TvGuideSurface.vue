<script setup lang="ts">
/**
 * TV Guide Surface — EPG schedule grid with DVR scheduling
 */
import UIcon from '@/skills/atoms/UIcon.vue'

const channels = [
  { id: '1', name: 'ABC', programs: [{ title: 'News at 6', time: '18:00–19:00', width: 180 }, { title: 'Drama Hour', time: '19:00–20:00', width: 180 }, { title: 'Late Show', time: '20:00–21:00', width: 180 }] },
  { id: '2', name: 'SBS', programs: [{ title: 'World News', time: '18:00–18:30', width: 90 }, { title: 'Documentary', time: '18:30–20:00', width: 270 }, { title: 'Movie Night', time: '20:00–22:00', width: 360 }] },
  { id: '3', name: 'Seven', programs: [{ title: 'Home & Away', time: '18:00–19:00', width: 180 }, { title: 'MKR', time: '19:00–20:30', width: 270 }] },
]
</script>

<template>
  <div class="surface">
    <div class="surface__header">
      <h1 class="surface__title">TV Guide</h1>
      <p class="surface__description">Live TV schedule & DVR recordings</p>
    </div>

    <div class="hn-tv-guide">
      <!-- Timebar -->
      <div class="hn-tv-guide__timebar">
        <div style="width: 180px; flex-shrink: 0; padding: 0 var(--usx-spacing-md); font-weight: var(--usx-font-weight-semibold)"></div>
        <div v-for="h in ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00']" :key="h"
             style="width: 180px; flex-shrink: 0; text-align: center; font-size: var(--usx-font-size-xs); color: var(--usx-color-on-surface-muted)">
          {{ h }}
        </div>
      </div>

      <!-- Channels -->
      <div class="hn-tv-guide__channels">
        <div v-for="ch in channels" :key="ch.id" class="hn-tv-guide__channel-row">
          <div class="hn-tv-guide__channel-name">
            <UIcon name="live_tv" /> &nbsp;{{ ch.name }}
          </div>
          <button
            v-for="prog in ch.programs"
            :key="prog.time"
            class="hn-tv-guide__program"
            :style="{ width: prog.width + 'px' }"
          >
            <div class="hn-tv-guide__program-title">{{ prog.title }}</div>
            <div class="hn-tv-guide__program-time">{{ prog.time }}</div>
          </button>
        </div>
      </div>
    </div>

    <div class="surface__footer" style="display: flex; gap: var(--usx-spacing-md); justify-content: center">
      <span class="usx-badge usx-badge--accent">
        <UIcon name="fiber_manual_record" /> 2 recordings scheduled
      </span>
    </div>
  </div>
</template>