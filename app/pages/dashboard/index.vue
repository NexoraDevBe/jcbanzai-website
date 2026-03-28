<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})
</script>

<template>
<main id="dashboard-page">
  <h1>Dashboard overzicht</h1>
  <section>
  </section>
</main>
</template>

<style scoped lang="scss">
#dashboard-page {
  h1 {
    font-size: 3rem;
  }
}
</style>