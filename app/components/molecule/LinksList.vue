<script setup lang="ts">
interface Link {
  text: string
  href: string
  external?: boolean
}

interface Props {
  links: Link[]
}

defineProps<Props>()
</script>

<template>
  <ul class="links-list">
    <AtomLinkItem
        v-for="link in links"
        :key="link.text"
        :href="link.href"
        :external="link.external"
    >
      {{ link.text }}
    </AtomLinkItem>
  </ul>
</template>

<style scoped lang="scss">
.links-list {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: .2rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>