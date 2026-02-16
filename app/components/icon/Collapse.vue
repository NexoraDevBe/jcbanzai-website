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
    <path d="M2 6H8M2 18H8M2 12H10M14 5L18 9L22 5M14 19L18 15L22 19" :stroke="`var(--${color})`" :stroke-width="strokeWidth" stroke-linecap="round"/>
  </svg>
</template>

<style scoped lang="scss">

</style>