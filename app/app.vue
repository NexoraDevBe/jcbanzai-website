<script setup lang="ts">
useHead({
  title: 'Judoclub Banzai',
  meta: [
    { name: 'description', content: 'My amazing site.' }
  ],
})
</script>

<template>
  <OrganismAppHeader/>
  <NuxtPage/>
  <OrganismAppFooter/>
  <AtomCursorFollow/>
</template>

<style scoped lang="scss">
.page-enter-active,
.page-leave-active {
  transition: all .2s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>