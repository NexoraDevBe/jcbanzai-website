<script setup lang="ts">
interface Social {
  name: string
  href: string
}

interface Props {
  socials: Social[]
}

defineProps<Props>()
</script>

<template>
  <ul class="socials-list">
    <li>
      <NuxtLink to="https://www.instagram.com/judoclubbanzai/" external>
        <IconInstagram :size="40" :stroke-width="1.5"/>
      </NuxtLink>
    </li>
    <li>
      <NuxtLink to="https://www.facebook.com/judoclubbanzai" external>
        <IconFacebook :size="40" :stroke-width="1.5"/>
      </NuxtLink>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.socials-list {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: .2rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>