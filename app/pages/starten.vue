<script setup lang="ts">
useHead({
  title: 'Judoclub Banzai - Starten?',
  meta: [
    { name: 'description', content: 'My amazing site.' }
  ],
})

const infoSections = [
  {
    japText: '入門レッスン',
    title: 'Initiatie lessen',
    content: `Om te ontdekken of judo echt iets voor jou is, nodigen wij je graag uit voor een aantal gratis initiatielessen.
    Voor volwassenen & kinderen vanaf de lagere school voorzien wij <b>4 gratis proeflessen</b>.
    Voor de allerkleinsten die willen starten met kleuterjudo, bieden wij <b>2 gratis lessen</b> aan.`,
    right: false
  },
  {
    japText: 'ドキュメント',
    title: 'Initiatie document',
    content: `Om alles vlot te laten verlopen, vragen we je om de <b>gegevens van het lid</b> in <NuxtLink to="/pdf/Initiatieformulier.pdf" target="_blank" external>dit document</NuxtLink> in te vullen en onderaan te tekenen.
    De trainers zorgen zelf voor het invullen van de datums.
    Vergeet niet om het ingevulde document <b>mee te brengen naar de eerste les</b> en het aan de trainer af te geven.`,
    right: true
  },
  {
    japText: 'クローヅング',
    title: 'Kleding',
    content: `Voor de initiatielessen is een judopak nog niet nodig.
    We raden aan om <b>gemakkelijke sportkledij</b> te dragen waarin je vlot kan bewegen, zoals een joggingbroek met t-shirt of een trainingspak.
    Zo kan je zorgeloos deelnemen en je volledig concentreren op het ontdekken van de sport.`,
    right: false
  },
  {
    japText: 'エンロール',
    title: 'Inschrijven',
    content: `Je kan je <b>het hele jaar door inschrijven</b>, zodat je altijd de mogelijkheid hebt om te starten wanneer het jou het beste uitkomt.
    Of je nu meteen enthousiast aan de slag wilt gaan of liever eerst rustig de sfeer komt opsnuiven: er is geen vaste instapdatum.`,
    right: true
  }
]

const membershipGroups = [
  {
    title: 'Kleuterjudo',
    ageGroup: '2020 - 2021',
    cards: [
      { japText: 'ファミリー', title: 'Leden v/h gezin', starred: true, content: 'Totaal', subContent: 'incl. verzekering' },
      { japText: 'シーズン', title: 'Volledig seizoen', price: 150.00 }
    ]
  },
  {
    title: 'Judoka\'s',
    ageGroup: '2019',
    cards: [
      { japText: 'ファミリー', title: 'Leden v/h gezin', starred: true, content: 'Totaal', subContent: 'incl. verzekering' },
      { japText: 'ファースト', title: '1ste lid', price: 167.00 },
      { japText: 'セコンド', title: '2de lid', price: 152.00 },
      { japText: 'サード', title: '3de lid', price: 137.00 },
    ]
  },
  {
    title: 'Judoka\'s',
    ageGroup: '2013 - 2018',
    cards: [
      { japText: 'ファミリー', title: 'Leden v/h gezin', starred: true, content: 'Totaal', subContent: 'incl. verzekering' },
      { japText: 'ファースト', title: '1ste lid', price: 190.00 },
      { japText: 'セコンド', title: '2de lid', price: 175.00 },
      { japText: 'サード', title: '3de lid', price: 160.00 },
    ]
  },
  {
    title: 'Judoka\'s',
    ageGroup: '2012 of ouder',
    cards: [
      { japText: 'ファミリー', title: 'Leden v/h gezin', starred: true, content: 'Totaal', subContent: 'incl. verzekering' },
      { japText: 'ファースト', title: '1ste lid', price: 192.00 },
      { japText: 'セコンド', title: '2de lid', price: 177.00 },
      { japText: 'サード', title: '3de lid', price: 162.00 },
    ]
  }
]
</script>

<template>
  <main id="starten-page">
    <h1>
      Starten<span>?</span>
    </h1>
    <OrganismInfoSection :sections="infoSections" />
    <OrganismMembershipSection :groups="membershipGroups" />
  </main>
</template>

<style scoped lang="scss">
#starten-page {
  h1 {
    span {
      color: var(--accent);
    }
  }
}
</style>