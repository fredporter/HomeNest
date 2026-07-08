<script setup lang="ts">
/**
 * TV Guide Surface — EPG schedule grid with live data from Jellyfin Live TV.
 * Falls back to static demo data when no Jellyfin connection is available.
 */
import { onMounted, computed } from 'vue'
import { useTVStore } from '@/stores/tv'
import UIcon from '@/skills/atoms/UIcon.vue'

const tv = useTVStore()

onMounted(() => {
  tv.fetchGuide()
})
</script>

<template>
  <div class="surface">
    <div class="surface__header">
      <h1 class="surface__title">TV Guide</h1>
      <p class="surface__description" v-if="tv.liveOnline">
        {{ tv.channels.length }} channels &middot; Live
      </p>
      <p class="surface__description" v-else>
        No Live TV tuner configured. Connect a Jellyfin tuner to see channels.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="tv.loading" class="usx-flex-center" style="padding: var(--usx-spacing-2xl)">
      <div style="width: 40px; height: 40px; border: 4px solid var(--usx-color-border); border-top-color: var(--usx-color-primary); border-radius: 50%; animation: spin 0.8s linear infinite"></div>
    </div>

    <!-- Empty / demo fallback -->
    <div v-else-if="!tv.channels.length" class="usx-flex-center" style="padding: var(--usx-spacing-2xl); color: var(--usx-color-on-surface-muted)">
      <div style="text-align: center">
        <UIcon name="live_tv" />
        <p style="margin-top: var(--usx-spacing-md)">No Live TV channels found.</p>
        <p style="font-size: var(--usx-font-size-xs)">Connect a TV tuner in Jellyfin to populate this guide.</p>
      </div>
    </div>

    <!-- Live EPG grid -->
    <template v-else>
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
          <div v-for="ch in tv.channels" :key="ch.id" class="hn-tv-guide__channel-row">
            <div class="hn-tv-guide__channel-name">
              <UIcon name="live_tv" /> {{ ch.number ? ch.number + ' ' : '' }}{{ ch.name }}
            </div>
            <template v-if="tv.getProgrammesForChannel(ch.id).length">
              <button
                v-for="prog in tv.getProgrammesForChannel(ch.id)"
                :key="prog.id"
                class="hn-tv-guide__program"
                :style="{ width: '180px' }"
                :title="prog.overview"
              >
                <div class="hn-tv-guide__program-title">{{ prog.title }}</div>
                <div class="hn-tv-guide__program-time">{{ prog.time }}</div>
              </button>
            </template>
            <div v-else class="hn-tv-guide__program" style="width: 540px; opacity: 0.4">
              <div class="hn-tv-guide__program-title">No programme data</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>