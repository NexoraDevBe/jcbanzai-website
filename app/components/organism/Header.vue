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

</style>