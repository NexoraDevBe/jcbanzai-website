<script setup lang="ts">
interface Sponsor {
  path: string
  link: string
  name?: string
}

interface Props {
  sponsor: Sponsor
}

defineProps<Props>()
</script>

<template>
  <div class="sponsor-item">
    <AtomSponsorImage :src="sponsor.path" :alt="`${sponsor.name || 'Sponsor'} logo`" />
    <NuxtLink
        :to="sponsor.link"
        target="_blank"
        external
        class="sponsor-link"
        :aria-label="`Visit ${sponsor.name || 'sponsor'} website`"
    />
  </div>
</template>

<style scoped lang="scss">
.sponsor-item {
  position: relative;
  height: 6rem;
  flex-shrink: 0;

  &:hover {
    :deep(.sponsor-image) {
      opacity: 1;
      filter: grayscale(0%);
    }
  }

  .sponsor-link {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: .6rem;
    z-index: 1;
    text-decoration: none;
  }
}
</style>