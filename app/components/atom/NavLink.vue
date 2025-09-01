<script setup lang="ts">
interface Props {
  to: string
  label: string
  external?: boolean
}

defineProps<Props>()
</script>

<template>
  <NuxtLink
      :to="to"
      :target="external ? '_blank' : undefined"
      :class="['nav-link', { 'external': external }]"
  >
    {{ label }}
  </NuxtLink>
</template>

<style scoped lang="scss">
.nav-link {
  color: var(--secondary);
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  text-transform: uppercase;
}
</style>