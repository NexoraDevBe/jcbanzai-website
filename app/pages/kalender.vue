<script setup lang="ts">

</script>

<template>
  <main id="calendar-page">
    <h1>Kalender</h1>
    <section>
      <h2>Activiteiten & Verlof</h2>
      <iframe src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSaLiJriQHBfC0TFtTONmcdcykK7SbRzZPInA17CaNrlKw1KyVAo0zdZABy4MAoF65SH2lX1eFoYjov/pubhtml?widget=false&amp;headers=false&amp;chrome=false"></iframe>
    </section>
    <section>
      <h2>Wedstrijden</h2>
      <iframe src="https://docs.google.com/spreadsheets/d/e/2PACX-1vTFOobc2INzEoLczfFF7bYISvShBWWrcyHTAl1lmeo321z_HYD866wao4CaHkSWo_BiqQ89-SScTKDf/pubhtml?widget=false&amp;headers=false&amp;chrome=false"></iframe>
    </section>
  </main>
</template>

<style scoped lang="scss">
#calendar-page {
  section {
    iframe {
      width: 100%;
      height: 70vh;
      border: none;
      border-radius: 1rem;
    }

    &:nth-of-type(even) {
      text-align: right;
    }
  }
}

@media screen and (width >= 64rem) {
  #calendar-page {
    section {
      iframe {
        width: 80%;
      }
    }
  }
}
</style>