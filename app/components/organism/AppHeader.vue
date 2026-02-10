<script setup lang="ts">
import { useUserStore } from "~/stores/user";

const store = useUserStore();
const userRole = store.userRole;

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', locked: userRole === '' },
  { to: '/', label: 'Home' },
  { to: '/starten', label: 'Starten?' },
  { to: '/trainingen', label: 'Trainingen' },
  { to: '/locatie', label: 'Locatie' },
  { to: '/kalender', label: 'Kalender' },
  { to: '/nieuws', label: 'Nieuws' },
  { to: '/gallerij', label: 'Gallerij' },
  { to: 'https://judoclubbanzai.inker.be/', label: 'Webshop', external: true },
]

const dashboardItems = [
  { to: '/', label: 'Website' },
  { to: '/dashboard', label: 'Overzicht' },
  { to: '/dashboard/ledenlijst', label: 'Ledenlijst' },
  { to: '/dashboard/leerlijn', label: 'Leerlijn' },
  { to: '/dashboard/trainers', label: 'Planning' },
]

const state = ref<boolean>(false)
const hasInteracted = ref<boolean>(false)
const route = useRoute()
const dashboardpath = computed(() => route.path.split('/')[1])
const authpath = computed(() => route.path === '/dashboard/auth')

watch(() => route.path, () => {
  state.value = false
}, { immediate: true })

const toggle = () => {
  hasInteracted.value = true
  state.value = !state.value
}
</script>

<template>
  <header>
    <nav :class="{ 'nav-open': state }">
      <MoleculeNavList v-if="!authpath && dashboardpath === 'dashboard'" :items="dashboardItems"/>
      <MoleculeNavList v-else-if="!authpath && dashboardpath !== 'dashboard'" :items="navigationItems"/>
    </nav>
    <AtomBurgerMenu
        :is-open="state"
        :has-interacted="hasInteracted"
        @toggle="toggle"
    />
  </header>
</template>

<style scoped lang="scss">
header {
  position: fixed;
  inset: 0;
  width: 100dvw;
  height: 100dvh;
  margin: 0;
  z-index: 1000;
  pointer-events: none;
  transition: none;

  nav {
    max-width: 1920px;
    padding: 0 var(--page-margin);
    margin: 0 auto;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-20px);
    transition: none;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100dvh;

    &.nav-open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
      transition-delay: 0.2s;
    }
  }
}

@media screen and (width >= 64rem) {
  header {
    height: fit-content;

    :deep(.burger-menu-container) {
      display: none;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-color: var(--primary-50);
      backdrop-filter: blur(5px);
      z-index: -2;
    }

    nav {
      pointer-events: all;
      opacity: 1;
      visibility: visible;
      transform: none;
      height: auto;
      transition: none;
    }
  }
}
</style>