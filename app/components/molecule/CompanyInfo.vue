<script setup lang="ts">
interface Props {
  companyDetails: string[]
}

defineProps<Props>()
</script>

<template>
  <ul class="company-info">
    <li v-for="info in companyDetails" :key="info">
      {{ info }}
    </li>
  </ul>
</template>

<style scoped lang="scss">
.company-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: .2rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>