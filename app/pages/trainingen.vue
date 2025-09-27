<script setup lang="ts">
useHead({
  title: 'Judoclub Banzai - Trainingen',
  meta: [
    { name: 'description', content: 'Ontdek de trainingsschema\'s van Judoclub Banzai in Gavere en Nazareth. Van kleuterjudo tot wedstrijdtraining, voor alle leeftijden en niveaus. Leer onze ervaren trainers kennen.' }
  ],
})

type BeltColors = 'white' | 'yellow' | 'orange' | 'green' | 'blue' | 'brown' | 'black'
type BeltStatus = Record<BeltColors, boolean>
type ScheduleRow = [string, number[], string[], string, string, BeltStatus]

const trainerItems = [
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Raymond\n De Clerq', subContent: 'Trainer A \n 8e dan \n Hoofdtrainer' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Philippe\n Rousseau', subContent: 'Initiator \n 1e dan \n API contactpersoon' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Kristof\n Van Laere', subContent: 'Initiator \n 1e dan \n Jeugdsportbegeleider' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Jasper\n Vandenheede', subContent: 'Initiator \n 1e dan \n Coordinatie volwassenen groep' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Edward\n Vermeersch', subContent: 'Initiator \n 1e dan \n provinciaal scheidsrechter' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Amber\n Simoens', subContent: 'Initiator \n 1e dan \n Coördinatie wedstrijden en wedstrijdtrainingen' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Brent\n Marysse', subContent: 'Aspirant Initiator \n 1e dan' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Dimitri\n Michiels', subContent: 'Instructeur B \n 2e dan' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Ruth\n Schelstraete', subContent: 'Initiator \n 1e dan \n API contactpersoon' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Frederic\n Vandenabeele', subContent: 'Aspirant Initiator \n 1e kyu' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Hannes\n Vanluchene', subContent: '1e dan' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Tom\n Deneire', subContent: '3e kyu \n Hulptrainer jeugd' },
  { image: {src: '/assets/images/unknown.png'}, japText: 'トレーナー', title: 'Tom\n Van Den Noortgaete', subContent: '1e kyu \n Hulptrainer jeugd' },
]

const scheduleData: ScheduleRow[] = [
  ['Kleuters', [4, 5], ['Zondag'], '09u00 - 09u45', 'Gavere',
    { white: true, yellow: false, orange: false, green: false, blue: false, brown: false, black: false }],
  ['Gezamenlijk', [5, 99], ['Zondag'], '10u00 - 11u30', 'Gavere',
    { white: true, yellow: true, orange: true, green: true, blue: true, brown: true, black: true }],
  ['Jeugd', [5, 12], ['Maandag', 'Donderdag'], '18u30 - 19u30', 'Nazareth',
    { white: true, yellow: true, orange: true, green: true, blue: false, brown: false, black: false }],
  ['Volwassenen', [12, 99], ['Maandag', 'Donderdag'], '19u30 - 21u00', 'Nazareth',
    { white: true, yellow: true, orange: true, green: true, blue: true, brown: true, black: true }],
  ['Wedstrijd', [8, 99], ['Woensdag'], '18u00 - 19u30', 'Gavere',
    { white: false, yellow: true, orange: true, green: true, blue: true, brown: true, black: true }],
]
</script>

<template>
<main id="trainging-page">
  <h1>Trainingen</h1>
  <section class="trainings">
    <MoleculeScheduleList :schedule-data="scheduleData"/>
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

</style>