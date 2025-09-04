<script setup lang="ts">
interface Props {
  href: string
  external?: boolean
}

defineProps<Props>()
</script>

<template>
  <li class="link-item">
    <NuxtLink
        :to="href"
        :target="external ? '_blank' : undefined"
        :external="external"
        class="link"
    >
      <slot />
    </NuxtLink>
  </li>
</template>

<style scoped lang="scss">
.link-item {
  .link {
    color: inherit;
    text-decoration: none;
  }
}
</style>