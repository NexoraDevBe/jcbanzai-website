<script setup lang="ts">
useHead({
  title: 'Judoclub Banzai - Judo in Gavere & Nazareth',
  meta: [
    {
      name: 'description',
      content: 'Welkom bij Judoclub Banzai! Ontdek de uitdagende judosport voor jong en oud. Versterk je lichaam, geest en zelfvertrouwen in een warme club in Gavere en Nazareth. Start vandaag nog met judo!'
    },
    {
      name: 'keywords',
      content: 'Judoclub Banzai, judo Gavere, judo Nazareth, judo Oost-Vlaanderen, judo lessen, judo club, kleuterjudo, judo volwassenen, judo zelfvertrouwen, sportclub Gavere, sportclub Nazareth'
    },
    {
      property: 'og:title',
      content: 'Judoclub Banzai - Judo in Gavere & Nazareth'
    },
    {
      property: 'og:description',
      content: 'Word lid van Judoclub Banzai! Judo voor kinderen, jongeren en volwassenen in Gavere en Nazareth. Gratis proeflessen en een sterke, hechte clubwerking.'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:image',
      content: '/assets/images/judoclub-banzai-hero.jpg' // optioneel: hero-afbeelding met judoka’s of clublogo
    },
    {
      name: 'author',
      content: 'Judoclub Banzai'
    }
  ],
})

const ctaStarten = () => {
  navigateTo('/starten')
}

const ctaInschrijven = () => {
  navigateTo('/inschrijven')
}
</script>

<template>
  <main id="home-page">
    <section class="hero">
      <AtomJapaneseText :outline="true" :size="4" :vertical="false">バーンザイ</AtomJapaneseText>
      <h1 class="hero-title">Judoclub<br> <span>Banzai</span></h1>
      <div class="cta-container">
        <AtomCallToAction :on-click="ctaStarten">
          Starten?
        </AtomCallToAction>
        <AtomCallToAction :class-name="'outline'" :on-click="ctaInschrijven">
          Inschrijven?
        </AtomCallToAction>
      </div>
    </section>
    <section class="intro">
      <MoleculeStyledParagraph class="paragraph" :max-width="'30rem'">
        <template #styleElement>
          <AtomJapaneseText :vertical="true" :size="3" :outline="true">イントロ</AtomJapaneseText>
        </template>
        <template #content>
          Ben je op zoek naar een uitdagende, gevarieerde hobby, met veel mogelijkheden? Dan is judo de sport bij uitstek. Naast de fysieke ontwikkeling is ook het mentale welbevinden van judoka's belangrijk. Een groter zelfvertrouwen en leren omgaan met de eigen mogelijkheden zijn kernwaarden.
        </template>
      </MoleculeStyledParagraph>
    </section>
  </main>
</template>

<style scoped lang="scss">
#home-page {
  padding: 0;

  .hero {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100dvh;
    padding-bottom: 3rem;

    .hero-title {
      margin: 0;
      margin-bottom: 2rem;
      line-height: .8;
      font-size: 18vw;
      font-weight: 400;
      text-transform: uppercase;

      span {
        font-size: 25vw;
      }
    }

    .cta-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
  }

  .intro {
    .paragraph {
      margin-left: var(--page-margin);
    }
  }
}

@media screen and (width >= 40rem) {
  #home-page {
    padding: 0;

    .hero {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: start;
      height: 100dvh;

      :deep(.scroll-indicator) {
        display: none;
      }

      .cta-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
      }
    }

    .intro {
      position: relative;
      display: flex;
      height: 2rem;

      .paragraph {
        position: absolute;
        left: 25vw;
        bottom: 0;
      }
    }
  }
}

@media screen and (width >= 48rem) {
  #home-page {
    padding: 0;

    .hero {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: start;
      height: 100dvh;

      .hero-title {
        margin: 0;
        line-height: .8;
        font-size: 8rem;
        font-weight: 400;
        text-transform: uppercase;

        span {
          font-size: 11.2rem;
        }
      }
    }

    .intro {
      position: relative;
      display: flex;
      height: 2rem;

      .paragraph {
        position: absolute;
        left: 25vw;
        bottom: 0;
      }
    }
  }
}

@media screen and (width >= 64rem) {
  #home-page {
    padding: 0;

    .hero {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: start;
      height: 100dvh;

      .hero-title {
        margin: 0;
        line-height: .8;
        font-size: 8rem;
        font-weight: 400;
        text-transform: uppercase;

        span {
          font-size: 11.2rem;
        }
      }

      &::after {
        display: block;
        position: absolute;
        top: 10vh;
        right: -20%;
        content: '';
        height: 50dvw;
        max-height: 100%;
        min-height: 30rem;
        aspect-ratio: 1;
        background-color: var(--accent);
        border-radius: 50%;
        z-index: -1;
      }
    }

    .intro {
      position: relative;
      display: flex;
      height: 2rem;

      .paragraph {
        position: absolute;
        left: 25vw;
        bottom: 0;
      }
    }
  }
}

@media screen and (width >= 80rem) {
  #home-page {
    padding: 0;

    .hero {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100dvh;

      .hero-title {
        margin: 0;
        line-height: .8;
        font-size: 10rem;
        font-weight: 400;
        text-transform: uppercase;

        span {
          font-size: 14rem;
        }
      }

      .cta-container {
        margin-left: 4rem;
      }

      &::after {
        display: block;
        position: absolute;
        top: 10vh;
        right: -20%;
        content: '';
        height: 50dvw;
        max-height: 100%;
        min-height: 40rem;
        aspect-ratio: 1;
        background-color: var(--accent);
        border-radius: 50%;
        z-index: -1;
      }
    }

    .intro {
      position: relative;
      display: flex;
      height: 2rem;

      .paragraph {
        position: absolute;
        left: 25vw;
        bottom: 0;
      }
    }
  }
}
</style>