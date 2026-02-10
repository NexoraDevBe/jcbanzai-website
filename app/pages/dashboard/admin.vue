<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  requiredRole: 'admin',
  layout: 'dashboard',
})
</script>

<template>
<h1>Only admins can view</h1>
</template>

<style scoped lang="scss">

</style>