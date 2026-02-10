<script setup lang="ts">
import { computed } from 'vue'
import {logout} from "~/utils/supabase";

interface NavItem {
  to: string
  label: string
  external?: boolean
  locked?: boolean
}

interface Props {
  items: NavItem[]
}

const props = defineProps<Props>()

const visibleItems = computed(() =>
    props.items.filter(item => !item.locked)
)
const route = useRoute()
const store = useUserStore()
const path = computed(() => route.path.split('/')[1])
</script>

<template>
  <ul class="nav-list">
    <li v-for="item in visibleItems" :key="item.to">
      <AtomNavLink
          :to="item.to"
          :label="item.label"
          :external="item.external"
      />
    </li>
    <li v-if="store.userData && path === 'dashboard'" @click="logout">
      <span class="logout">
        uitloggen
      </span>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.nav-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  width: 100%;
  margin: 0;
  padding: 1rem 0;
  list-style: none;
  z-index: 1005;

  li {
    position: relative;
    pointer-events: all;

    .logout {
      color: var(--accent);
      text-decoration: none;
      font-size: 1.25rem;
      font-weight: bold;
      text-transform: uppercase;
      cursor: pointer;
    }

    @media screen and (width >= 80rem) {
      .logout {
        font-size: 1.5rem;
      }
    }

    &:has(.router-link-active) {
      &::before {
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
        transform: translateX(-25%) translateY(-50%);
        z-index: -1;
      }
    }
  }
}

@media screen and (width >= 64rem) {
  .nav-list {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 0;
    width: 100%;
    margin: 0;
    padding: 1rem 0;
    list-style: none;

    li {
      position: relative;

      &::before {
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
        transform: translateX(-25%) translateY(-300%);
        z-index: -1;
        transition: transform .3s ease-in-out;
      }

      &:has(.router-link-active) {
        &::before {
          transform: translateX(-25%) translateY(-50%);
        }
      }
    }
  }
}
</style>