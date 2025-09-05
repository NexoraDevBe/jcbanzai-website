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
  align-items: center;
  gap: .5rem;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  text-align: center;
}

@media screen and (width >= 1280px) {
  .company-info {
    align-items: flex-start;
    text-align: left;
    width: fit-content;
  }
}
</style>