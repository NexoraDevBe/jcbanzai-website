<script setup lang="ts">
interface Props {
  size?: number
  strokeWidth?: number
  color?: string
  asc?: boolean,
  desc?: boolean,
}

withDefaults(defineProps<Props>(), {
  size: 24,
  strokeWidth: 1.5,
  color: 'secondary',
  asc: true,
  desc: true,
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 9L12 3L17 9" :stroke="`var(--${color})`" :stroke-width="strokeWidth" stroke-linecap="round" :opacity="asc ? 1 : .2"/>
    <path d="M7 15L12 21L17 15" :stroke="`var(--${color})`" :stroke-width="strokeWidth" stroke-linecap="round"  :opacity="desc ? 1 : .2"/>
  </svg>
</template>

<style scoped lang="scss">

</style>