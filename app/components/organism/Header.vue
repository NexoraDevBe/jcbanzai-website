<script setup lang="ts">
const navigationItems = [
  { to: '/', label: 'Home' },
  { to: '/starten', label: 'Starten?' },
  { to: '/trainingen', label: 'Trainingen' },
  { to: '/locatie', label: 'Locatie' },
  { to: '/kalender', label: 'Kalender' },
  { to: '/nieuws', label: 'Nieuws' },
  { to: '/gallerij', label: 'Gallerij' },
  { to: 'https://judoclubbanzai.inker.be/', label: 'Webshop', external: true }
]
</script>

<template>
  <header>
    <nav>
      <MoleculeNavList :items="navigationItems"/>
    </nav>
  </header>
</template>

<style scoped lang="scss">
header {
  position: fixed;
  width: 100%;
  margin: 0;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;

  &::after {
    display: block;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--primary-50);
    backdrop-filter: blur(5px);
    z-index: -2;
  }

  nav {
    max-width: 1920px;
    padding: 0 4rem;
    margin: 0 auto;
  }
}
</style>