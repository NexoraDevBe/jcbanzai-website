<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps({
  error: Object as () => NuxtError,
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <OrganismAppHeader/>
  <main id="error-page">
    <h1>Oeps... {{ error?.statusCode }}</h1>
    <h3>
      Deze pagina lijkt van de tatami gevallen.<br>
      Zelfs de beste judoka’s verliezen soms hun balans.<br>
      Ga terug naar de homepagina en probeer het opnieuw!
    </h3>
    <AtomCallToAction :on-click="handleError">
      Home
    </AtomCallToAction>
  </main>
  <AtomCursorFollow/>
</template>

<style scoped lang="scss">
#error-page {

}
</style>