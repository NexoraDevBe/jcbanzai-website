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
    <path d="M2 6H10M2 18H10M2 12H8M14 9L18 5L22 9M14 15L18 19L22 15" :stroke="`var(--${color})`" :stroke-width="strokeWidth" stroke-linecap="round"/>
  </svg>
</template>

<style scoped lang="scss">

</style>