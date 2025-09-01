<script setup lang="ts">
interface NavItem {
  to: string
  label: string
  external?: boolean
}

interface Props {
  items: NavItem[]
}

defineProps<Props>()
</script>

<template>
  <ul class="nav-list">
    <li v-for="item in items" :key="item.to">
      <AtomNavLink
          :to="item.to"
          :label="item.label"
          :external="item.external"
      />
    </li>
  </ul>
</template>

<style scoped lang="scss">
.nav-list {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: 1rem 0;
  padding: 0;
  list-style: none;

  li {
    position: relative;

    &::after {
      $size: 2rem;
      content: "";
      display: block;
      position: absolute;
      top: 50%;
      left: 0;
      background-color: var(--accent);
      width: $size;
      height: $size;
      border-radius: 50%;
      transform: translateX(-25%) translateY(-200%);
      z-index: -1;
      transition: transform .3s ease-in-out;
    }

    &:has(.router-link-active) {
      &::after {
        transform: translateX(-25%) translateY(-50%);
      }
    }
  }
}
</style>