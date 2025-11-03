<script setup lang="ts">
useHead({
  title: 'Judoclub Banzai - Trainingen & Lesuren',
  meta: [
    {
      name: 'description',
      content: 'Ontdek het trainingsschema van Judoclub Banzai in Gavere en Nazareth. Van kleuterjudo tot wedstrijdtraining: bekijk de lesuren, leeftijden en locaties. Maak kennis met onze gediplomeerde trainers en vind de training die bij jou past.'
    },
    {
      name: 'keywords',
      content: 'judo trainingen, judoles Gavere, judoles Nazareth, judo schema, kleuterjudo, jeugdjudo, wedstrijdtraining, judo volwassenen, judo club Banzai, judo trainers'
    },
    {
      property: 'og:title',
      content: 'Judoclub Banzai - Trainingen & Lesuren'
    },
    {
      property: 'og:description',
      content: 'Bekijk de trainingsuren van Judoclub Banzai in Gavere en Nazareth. Voor alle leeftijden en niveaus, onder begeleiding van ervaren trainers.'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:image',
      content: '/assets/images/judoclub-banzai-trainingszaal.jpg' // optioneel: voeg hier je social preview-afbeelding toe
    }
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
  ['Wedstrijd*', [8, 99], ['Woensdag'], '18u00 - 19u30', 'Gavere',
    { white: false, yellow: true, orange: true, green: true, blue: true, brown: true, black: true }],
]

const scheduleInfo = [
    'Is de indeling in leeftijdsgroepen voor jouw gezin niet praktisch, contacteer ons dan om samen een gepaste oplossing te vinden. Opgegeven leeftijden zijn indicatief, overgang van de ene naar de andere groep is steeds bespreekbaar met de trainer.',
    '*Wedstrijd trainingen zijn enkel op uitnodiging.'
]

const scheduleStyledInfo = [
  {
    japText: 'トドラー',
    title: 'Kleuterjudo',
    content: `Laat uw zoon of dochter in de leeftijd van 4 tot 5 jaar kennismaken met kleuterjudo, een unieke mix van judo lichaamsvorming! In de kleuter judolessen staat plezier voorop. Veel oefeningen worden aangeboden in fantasievormen. Deze jonge judoka's leren de basis van het judospel op een voor hun aansprekende manier. Daarnaast worden hun lichamelijke en geestelijke ontwikkeling sterk gestimuleerd. Er is in de les veel aandacht voor oefeningen die coördinatie, snelheid, leren vallen en samenwerken bevorderen.`,
    right: false
  },
  {
    japText: 'ラーレン',
    title: 'Volgende Gordel',
    content: `Ben jij klaar voor de volgende stap in jouw judotraject? Op deze pagina vind je alles wat je nodig hebt om je voor te bereiden op jouw volgende gordel: overzicht van de vereiste technieken, duidelijke uitleg en demonstraties om je examen met vertrouwen tegemoet te gaan. Klik hieronder en ontdek alle informatie die je helpt om sterker, vaardiger en met trots jouw nieuwe gordel te behalen!`,
    right: true
  }
]

const cta = () => {
  navigateTo('/leerplan')
}
</script>

<template>
<main id="trainging-page">
  <h1>Trainingen</h1>
  <section class="trainingschedule">
    <MoleculeScheduleList class="schedule" :schedule-data="scheduleData" :schedule-info="scheduleInfo"/>
    <div class="paragraph-container">
      <MoleculeStyledParagraph
          v-for="(info, idx) in scheduleStyledInfo"
          :key="idx"
          class="paragraph"
          :right="info.right"
          :max-width="'45rem'"
      >
        <template #styleElement>
          <AtomJapaneseText :vertical="true" :size="3" :outline="true">
            {{ info.japText }}
          </AtomJapaneseText>
        </template>
        <template #title>
          {{ info.title }}
        </template>
        <template #content>
          <div v-html="info.content" />
        </template>
      </MoleculeStyledParagraph>
      <div class="button-wrapper">
        <AtomCallToAction :on-click="cta">
          Leren?
        </AtomCallToAction>
      </div>
    </div>
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
  .trainingschedule {
    &:deep(.schedule-table) {
      margin-bottom: 3rem;
    }

    .paragraph-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 4rem;
      padding: 0 var(--page-margin);

      &:deep(.right) {
        margin-left: auto;
        margin-top: 3rem;
      }

      .button-wrapper {
        width: 100%;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}

@media screen and (width >= 64rem) {
  #trainging-page {
    .trainingschedule {
      .paragraph-container {
        margin: 2rem var(--page-margin) 0;
        padding: 0;

        &:deep(.right) {
          margin-top: 0;
        }
      }
    }
  }
}
</style>