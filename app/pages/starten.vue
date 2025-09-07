<script setup lang="ts">
useHead({
  title: 'Judoclub Banzai - Starten?',
  meta: [
    { name: 'description', content: 'My amazing site.' }
  ],
})
</script>

<template>
  <main id="starten-page">
    <h1>
      Starten<span>?</span>
    </h1>
    <section class="info">
      <div class="paragraph-container">
        <MoleculeStyledParagraph class="paragraph" :max-width="'30rem'">
          <template #styleElement>
            <AtomJapaneseText :vertical="true" :size="3" :outline="true">入門レッスン</AtomJapaneseText>
          </template>
          <template #title>
            Initiatie lessen
          </template>
          <template #content>
            Om te ontdekken of judo echt iets voor jou is, nodigen wij je graag uit voor een aantal gratis initiatielessen.
            Voor volwassenen & kinderen vanaf de lagere school voorzien wij <b>4 gratis proeflessen</b>.
            Voor de allerkleinsten die willen starten met kleuterjudo, bieden wij <b>2 gratis lessen</b> aan.
          </template>
        </MoleculeStyledParagraph>
        <MoleculeStyledParagraph class="paragraph" :right="true" :max-width="'30rem'">
          <template #styleElement>
            <AtomJapaneseText :vertical="true" :size="3" :outline="true">ドキュメント</AtomJapaneseText>
          </template>
          <template #title>
            Initiatie document
          </template>
          <template #content>
            Om alles vlot te laten verlopen, vragen we je om de <b>gegevens van het lid</b> in <NuxtLink to="/pdf/Initiatieformulier.pdf" target="_blank" external>dit document</NuxtLink> in te vullen en onderaan te tekenen.
            De trainers zorgen zelf voor het invullen van de datums.
            Vergeet niet om het ingevulde document <b>mee te brengen naar de eerste les</b> en het aan de trainer af te geven.
          </template>
        </MoleculeStyledParagraph>
        <MoleculeStyledParagraph class="paragraph" :max-width="'30rem'">
          <template #styleElement>
            <AtomJapaneseText :vertical="true" :size="3" :outline="true">クローヅング</AtomJapaneseText>
          </template>
          <template #title>
            Kleding
          </template>
          <template #content>
            Voor de initiatielessen is een judopak nog niet nodig.
            We raden aan om <b>gemakkelijke sportkledij</b> te dragen waarin je vlot kan bewegen, zoals een joggingbroek met t-shirt of een trainingspak.
            Zo kan je zorgeloos deelnemen en je volledig concentreren op het ontdekken van de sport.
          </template>
        </MoleculeStyledParagraph>
        <MoleculeStyledParagraph class="paragraph" :right="true" :max-width="'30rem'">
        <template #styleElement>
          <AtomJapaneseText :vertical="true" :size="3" :outline="true">エンロール</AtomJapaneseText>
        </template>
        <template #title>
          Inschrijven
        </template>
        <template #content>
          Je kan je <b>het hele jaar door inschrijven</b>, zodat je altijd de mogelijkheid hebt om te starten wanneer het jou het beste uitkomt.
          Of je nu meteen enthousiast aan de slag wilt gaan of liever eerst rustig de sfeer komt opsnuiven: er is geen vaste instapdatum.
        </template>
      </MoleculeStyledParagraph>
      </div>
      <AtomJapaneseText class="japanese-text" :vertical="true" :size="5" :outline="true">スタート</AtomJapaneseText>
    </section>
  </main>
</template>

<style scoped lang="scss">
#starten-page {
  h1 {
    span {
      color: var(--accent);
    }
  }

  .info {
    display: flex;
    align-items: center;
    margin: 0 calc(var(--page-margin)*2);

    .paragraph-container {
      display: flex;
      flex-direction: column;
      gap: 4rem;
      width: 100%;

      .paragraph:nth-child(even) {
        align-self: flex-end;
      }
    }

    .japanese-text {
      display: none;
    }
  }
}

@media screen and (width >= 80rem) {
  #starten-page {
    .info {
      margin: 0 8rem;
      gap: 8rem;

      .japanese-text {
        display: block;
      }
    }
  }
}

@media screen and (width >= 90rem) {
  #starten-page {
    .info {
      margin: 0 12rem;
      gap: 12rem;
    }
  }
}
</style>