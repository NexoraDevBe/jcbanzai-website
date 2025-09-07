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
      class="nav-link"
  >
    {{ label }}
  </NuxtLink>
</template>

<style scoped lang="scss">
.nav-link {
  color: var(--secondary);
  text-decoration: none;
  font-size: 1.25rem;
  font-weight: bold;
  text-transform: uppercase;
}

@media screen and (width >= 80rem) {
  .nav-link {
    font-size: 1.5rem;
  }
}
</style>