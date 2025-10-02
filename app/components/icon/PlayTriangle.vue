<script setup lang="ts">
interface Props {
  size?: number
  strokeWidth?: number
  color?: string
}

withDefaults(defineProps<Props>(), {
  size: 24,
  strokeWidth: 1.5,
  color: 'light'
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.85 18.5185C9.2821 19.3305 8.25933 19.6688 7.38 19.4201C6.84076 19.2672 6.35021 18.9775 5.956 18.5791C5 17.6141 5 15.7431 5 12.0001C5 8.2571 5 6.3861 5.956 5.4211C6.35032 5.02303 6.84086 4.73366 7.38 4.5811C8.681 4.2111 10.296 5.1291 13.526 6.9641C16.866 8.8621 18.537 9.8111 18.891 11.1541C19.038 11.7085 19.038 12.2917 18.891 12.8461H18.89C18.5692 14.0664 17.1611 14.9614 14.4 16.5387" :stroke="`var(--${color})`" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<style scoped lang="scss">

</style>