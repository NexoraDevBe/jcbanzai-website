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
    <path d="M15 3.5H9C5.96243 3.5 3.5 5.96243 3.5 9V15C3.5 18.0376 5.96243 20.5 9 20.5H15C18.0376 20.5 20.5 18.0376 20.5 15V9C20.5 5.96243 18.0376 3.5 15 3.5Z" :stroke="`var(--${color})`" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 15.606C13.9916 15.606 15.606 13.9915 15.606 12C15.606 10.0085 13.9916 8.394 12 8.394C10.0085 8.394 8.39401 10.0085 8.39401 12C8.39401 13.9915 10.0085 15.606 12 15.606Z" :stroke="`var(--${color})`" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16.894 8.136C17.4629 8.136 17.924 7.67485 17.924 7.106C17.924 6.53715 17.4629 6.076 16.894 6.076C16.3252 6.076 15.864 6.53715 15.864 7.106C15.864 7.67485 16.3252 8.136 16.894 8.136Z" :fill="`var(--${color})`"/>
  </svg>
</template>

<style scoped lang="scss">

</style>