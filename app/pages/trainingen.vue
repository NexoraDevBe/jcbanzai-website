<script setup lang="ts">
const trainerItems = [
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Raymond\n De Clerq', subContent: 'Hoofdtrainer \n Trainer A \n 8e dan' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Philippe\n Rousseau', subContent: 'Initiator \n 1e dan \n API contactpersoon' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Kristof\n Van Laere', subContent: 'Initiator \n 1e dan \n Jeugdsportbegeleider' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Jasper\n Vandenheede', subContent: 'Initiator \n 1e dan \n Coordinatie volwassenen groep' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Edward\n Vermeersch', subContent: 'Initiator \n 1e dan \n provinciaal scheidsrechter' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Amber\n Simoens', subContent: 'Initiator \n 1e dan \n Coördinatie wedstrijden en wedstrijdtrainingen' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Brent\n Marysse', subContent: 'Aspirant Initiator \n 1e dan' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Dimitri\n Michiels', subContent: 'Instructeur B \n 2e dan \n Hoofdtrainer' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Ruth\n Schelstraete', subContent: 'Initiator \n 1e dan \n API contactpersoon' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Frederic\n Vandenabeele', subContent: 'Aspirant Initiator \n 1e kyu' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Hannes\n Vanluchene', subContent: '1e dan' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Tom\n Deneire', subContent: '3e kyu \n Hulptrainer jeugd' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Tom\n Van Den Noortgaete', subContent: '1e kyu \n Hulptrainer jeugd' },
]
</script>

<template>
<main id="trainging-page">
  <h1>Trainingen</h1>
  <section class="trainings">
    <MoleculeScheduleList/>
  </section>
  <h2>Trainers</h2>
  <section class="trainers">
    <MoleculeResponsiveCarousel :items="trainerItems" :interactive="true">
      <template #default="{ item }">
        <MoleculeCardItem :card="item"/>
      </template>
    </MoleculeResponsiveCarousel>
  </section>
</main>
</template>

<style scoped lang="scss">
#trainging-page {

}
</style>