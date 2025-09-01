<script setup lang="ts">
useHead({
  title: 'Judoclub Banzai',
  meta: [
    { name: 'description', content: 'My amazing site.' }
  ],
  bodyAttrs: {
    class: 'test'
  },
  script: [ { innerHTML: 'console.log(\'Hello world\')' } ]
})
</script>

<template>
  <OrganismHeader></OrganismHeader>
  <NuxtPage />
</template>
