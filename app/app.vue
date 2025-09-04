<script setup lang="ts">
useHead({
  title: 'Judoclub Banzai',
  meta: [
    { name: 'description', content: 'My amazing site.' }
  ],
  bodyAttrs: {
    class: 'test'
  }
})
</script>

<template>
  <OrganismAppHeader/>
  <NuxtPage/>
  <OrganismAppFooter/>
</template>

<style scoped lang="scss">
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>