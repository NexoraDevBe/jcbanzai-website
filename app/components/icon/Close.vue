<script setup lang="ts">
interface Props {
  size?: number
  strokeWidth?: number
  color?: string
}

withDefaults(defineProps<Props>(), {
  size: 24,
  strokeWidth: 1.5,
  color: 'secondary'
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 5L12 12M12 12L19 19M12 12L19 5M12 12L5 19" :stroke="`var(--${color})`" :stroke-width="strokeWidth" stroke-linecap="round"/>
  </svg>
</template>