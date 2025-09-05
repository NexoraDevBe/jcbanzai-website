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
      {{ link.text.replace('@', '&#8203;@') }}
    </AtomLinkItem>
  </ul>
</template>

<style scoped lang="scss">
.links-list {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: .5rem;
  margin: 0;
  padding: 0;
  list-style: none;
  text-align: center;
}

@media screen and (width >= 1024px) {
  .links-list {
    align-items: flex-start;
    text-align: left;
  }
}
</style>