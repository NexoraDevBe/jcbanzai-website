<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  requiredRole: 'superadmin'
})
</script>

<template>
<h1>Only superadmins can view</h1>
</template>

<style scoped lang="scss">

</style>