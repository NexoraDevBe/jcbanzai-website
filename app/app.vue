<script setup lang="ts">
useHead({
  title: 'Judoclub Banzai',
  meta: [{ name: 'description', content: 'My amazing site.' }],
});

const userStore = useUserStore();
userStore.getUser();
</script>

<template>
  <OrganismAppHeader />
  <NuxtLayout />
</template>
