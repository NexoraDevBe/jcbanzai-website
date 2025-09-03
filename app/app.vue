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
  <OrganismHeader/>
  <NuxtPage/>
  <OrganismFooter/>
</template>
