<script setup lang="ts">
interface Props {
  src: string
  alt: string
}

defineProps<Props>()
</script>

<template>
  <img
      :src="src"
      :alt="alt"
      class="sponsor-image"
  />
</template>

<style scoped lang="scss">
.sponsor-image {
  height: 100%;
  border-radius: .6rem;
  opacity: .8;
  filter: grayscale(100%);
  transition: filter 300ms ease-in-out, opacity 300ms ease-in-out;
}
</style>