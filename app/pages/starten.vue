<script setup lang="ts">
useHead({
  title: "Judoclub Banzai - Starten met Judo",
  meta: [
    {
      name: "description",
      content:
        "Wil je starten met judo bij Judoclub Banzai? Volg gratis proeflessen in Gavere of Nazareth! Ontdek hoe je je inschrijft, wat je nodig hebt voor de eerste les en bekijk onze lidgelden voor alle leeftijden.",
    },
    {
      name: "keywords",
      content:
        "judo starten, proeflessen judo, judo inschrijving, judoclub Banzai, judo Gavere, judo Nazareth, kleuterjudo, judo lidgeld, judo lessen, judo beginners",
    },
    {
      property: "og:title",
      content: "Judoclub Banzai - Starten met Judo",
    },
    {
      property: "og:description",
      content:
        "Begin met judo bij Judoclub Banzai! Gratis proeflessen, flexibele instap, duidelijke tarieven en begeleiding door ervaren trainers. Ideaal voor jong en oud.",
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:image",
      content: "/assets/images/judoclub-banzai-starten.jpg", // optioneel: afbeelding voor social previews
    },
  ],
});

const infoSections = [
  {
    japText: "入門レッスン",
    title: "Initiatie lessen",
    content: `Om te ontdekken of judo echt iets voor jou is, nodigen wij je graag uit voor een aantal gratis initiatielessen.
    Voor volwassenen & kinderen vanaf de lagere school voorzien wij <b>4 gratis proeflessen</b>.
    Voor de allerkleinsten die willen starten met kleuterjudo, bieden wij <b>2 gratis lessen</b> aan.`,
    right: false,
  },
  {
    japText: "ドキュメント",
    title: "Initiatie document",
    content: `Om alles vlot te laten verlopen, vragen we je om het formulier via de knop bovenaan in te vullen met de <b>gegevens van het lid</b>.
    Dit helpt ons om alles goed voor te bereiden.
    Gelieve het formulier bij voorkeur <b>vóór de eerste les</b> in te vullen.`,
    right: true,
  },
  {
    japText: "クローヅング",
    title: "Kleding",
    content: `Voor de initiatielessen is een judopak nog niet nodig.
    We raden aan om <b>gemakkelijke sportkledij</b> te dragen waarin je vlot kan bewegen, zoals een joggingbroek met t-shirt of een trainingspak.
    Zo kan je zorgeloos deelnemen en je volledig concentreren op het ontdekken van de sport.`,
    right: false,
  },
  {
    japText: "エンロール",
    title: "Inschrijven",
    content: `Je kan je <b>het hele jaar door inschrijven</b>, zodat je altijd de mogelijkheid hebt om te starten wanneer het jou het beste uitkomt.
    Of je nu meteen enthousiast aan de slag wilt gaan of liever eerst rustig de sfeer komt opsnuiven: er is geen vaste instapdatum.`,
    right: true,
  },
];

const membershipGroups = [
  {
    title: "Kleuterjudo",
    ageGroup: formatAgesToBirthYears([4, 5]),
    cards: [
      {
        japText: "ファミリー",
        title: "Leden v/h gezin",
        starred: true,
        content: "Totaal",
        subContent: "incl. verzekering",
      },
      { japText: "シーズン", title: "Alle leden", price: 155.0 },
    ],
  },
  {
    title: "Judoka's",
    ageGroup: formatAgesToBirthYears([6]),
    cards: [
      {
        japText: "ファミリー",
        title: "Leden v/h gezin",
        starred: true,
        content: "Totaal",
        subContent: "incl. verzekering",
      },
      { japText: "ファースト", title: "1ste lid", price: 172.0 },
      { japText: "セコンド", title: "2de lid", price: 152.0 },
      { japText: "サード", title: "3de lid", price: 137.0 },
    ],
  },
  {
    title: "Judoka's",
    ageGroup: formatAgesToBirthYears([7, 12]),
    cards: [
      {
        japText: "ファミリー",
        title: "Leden v/h gezin",
        starred: true,
        content: "Totaal",
        subContent: "incl. verzekering",
      },
      { japText: "ファースト", title: "1ste lid", price: 195.0 },
      { japText: "セコンド", title: "2de lid", price: 175.0 },
      { japText: "サード", title: "3de lid", price: 160.0 },
    ],
  },
  {
    title: "Judoka's",
    ageGroup: formatAgesToBirthYears([13, 99]),
    cards: [
      {
        japText: "ファミリー",
        title: "Leden v/h gezin",
        starred: true,
        content: "Totaal",
        subContent: "incl. verzekering",
      },
      { japText: "ファースト", title: "1ste lid", price: 197.0 },
      { japText: "セコンド", title: "2de lid", price: 177.0 },
      { japText: "サード", title: "3de lid", price: 162.0 },
    ],
  },
];

const handleClick = () => {
  navigateTo("/inschrijven");
};
</script>

<template>
  <main id="starten-page">
    <h2 class="sr-only">Info</h2>
    <div class="heading">
      <h1>Starten<span>?</span></h1>
      <AtomCallToAction class-name="cta" :on-click="handleClick">
        Inschrijven - Initiatie
      </AtomCallToAction>
    </div>
    <OrganismInfoSection :sections="infoSections" />
    <h2>Lidgeld</h2>
    <OrganismMembershipSection :groups="membershipGroups" />
  </main>
</template>

<style scoped lang="scss">
#starten-page {
  .heading {
    display: flex;
    flex-direction: column;

    h1 {
      span {
        color: var(--accent);
      }
      margin-bottom: 3rem;
    }

    .cta {
      align-self: center;
      margin-bottom: 2rem;
    }
  }
}

@media screen and (width >= 64rem) {
  #starten-page {
    .heading {
      flex-wrap: wrap;
      flex-direction: row;
      justify-content: space-between;

      h1 {
        margin-bottom: 5rem;
      }

      .cta {
        align-self: flex-end;
        margin-right: calc(var(--page-margin) * 3);
      }
    }
  }
}
</style>
