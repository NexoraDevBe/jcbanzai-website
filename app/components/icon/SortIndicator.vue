<script setup lang="ts">
interface Props {
  size?: number
  strokeWidth?: number
  color?: string
}

withDefaults(defineProps<Props>(), {
  size: 24,
  strokeWidth: 2,
  color: 'secondary'
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7H21"  :stroke="`var(--${color})`" :stroke-width="strokeWidth" stroke-linecap="round"/>
    <path d="M6 12H18" :stroke="`var(--${color})`" :stroke-width="strokeWidth" stroke-linecap="round"/>
    <path d="M8 17H16" :stroke="`var(--${color})`" :stroke-width="strokeWidth" stroke-linecap="round"/>
  </svg>
</template>