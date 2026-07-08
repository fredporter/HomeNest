<script setup lang="ts">
/**
 * UIcon — Material Symbols icon wrapper
 * Usage: <UIcon name="home" />
 */
defineProps<{ name: string }>()
</script>

<template>
  <span class="material-symbols-outlined" aria-hidden="true">{{ name }}</span>
</template>