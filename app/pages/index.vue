<script setup lang="ts">
import type { News } from '~/types';

const newsStore = useNewsStore();

useHead({
  title: 'Judoclub Banzai - Judo in Gavere & Nazareth',
  meta: [
    {
      name: 'description',
      content:
        'Welkom bij Judoclub Banzai! Ontdek de uitdagende judosport voor jong en oud. Versterk je lichaam, geest en zelfvertrouwen in een warme club in Gavere en Nazareth. Start vandaag nog met judo!',
    },
    {
      name: 'keywords',
      content:
        'Judoclub Banzai, judo Gavere, judo Nazareth, judo Oost-Vlaanderen, judo lessen, judo club, kleuterjudo, judo volwassenen, judo zelfvertrouwen, sportclub Gavere, sportclub Nazareth',
    },
    {
      property: 'og:title',
      content: 'Judoclub Banzai - Judo in Gavere & Nazareth',
    },
    {
      property: 'og:description',
      content:
        'Word lid van Judoclub Banzai! Judo voor kinderen, jongeren en volwassenen in Gavere en Nazareth. Gratis proeflessen en een sterke, hechte clubwerking.',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:image',
      content: '/assets/images/judoclub-banzai-hero.jpg', // optioneel: hero-afbeelding met judoka’s of clublogo
    },
    {
      name: 'author',
      content: 'Judoclub Banzai',
    },
  ],
});

const ctaStarten = () => {
  navigateTo('/starten');
};

const ctaInschrijven = () => {
  navigateTo('/inschrijven');
};

onMounted(async () => {
  await Promise.all([newsStore.fetchNewsposts()]);
});

const posts = computed<News[]>(() => {
  const today = new Date();

  return newsStore.newsposts.filter((n) => {
    const start = new Date(n.alert_start_date);
    const end = new Date(n.alert_end_date);

    return n.alert && today >= start && today <= end;
  });
});
</script>

<template>
  <main id="home-page">
    <section class="hero">
      <div>
        <AtomJapaneseText :outline="true" :size="4" :vertical="false">バーンザイ</AtomJapaneseText>
        <h1 class="hero-title rokkitt">
          Judoclub<br />
          <span>Banzai</span>
        </h1>
        <div class="cta-container">
          <AtomCallToAction :on-click="ctaStarten"> Initiatie? </AtomCallToAction>
          <AtomCallToAction :class-name="'outline'" :on-click="ctaInschrijven">
            Inschrijven?
          </AtomCallToAction>
        </div>
      </div>
      <div class="alert-container">
        <MoleculeAlertCard v-if="posts" v-for="p in posts" :post="p" />
      </div>
    </section>
    <section class="intro">
      <MoleculeStyledParagraph class="paragraph" :max-width="'30rem'">
        <template #styleElement>
          <AtomJapaneseText :vertical="true" :size="3" :outline="true">イントロ</AtomJapaneseText>
        </template>
        <template #content>
          Ben je op zoek naar een uitdagende, gevarieerde hobby, met veel mogelijkheden? Dan is judo
          de sport bij uitstek. Naast de fysieke ontwikkeling is ook het mentale welbevinden van
          judoka's belangrijk. Een groter zelfvertrouwen en leren omgaan met de eigen mogelijkheden
          zijn kernwaarden.
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

    .alert-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      position: absolute;
      width: calc(100% - (5.5rem - var(--page-margin)));
      top: 1rem;
      left: 0;
      min-height: 3.5rem;
    }

    .hero-title {
      margin: 0 0 2rem 0;
      line-height: 0.8;
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
    position: relative;

    .paragraph {
      margin-left: var(--page-margin);
    }
  }
}

@media (min-width: 40rem) {
  #home-page {
    .hero {
      align-items: flex-start;

      .cta-container {
        flex-direction: row;
      }
    }

    .intro {
      display: flex;
      height: 2rem;

      .paragraph {
        position: absolute;
        left: 25vw;
        bottom: 0;
        margin-left: 0;
      }
    }
  }
}

@media (min-width: 48rem) {
  #home-page {
    .hero {
      .hero-title {
        font-size: 8rem;

        span {
          font-size: 11.2rem;
        }
      }
    }
  }
}

@media (min-width: 64rem) {
  #home-page {
    .hero {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;

      .alert-container {
        position: static;
        max-width: 30rem;
      }

      &::after {
        content: '';
        position: absolute;
        top: 10vh;
        right: -20%;
        height: 50dvw;
        min-height: 30rem;
        max-height: 100%;
        aspect-ratio: 1;
        background-color: var(--accent);
        border-radius: 50%;
        z-index: -1;
      }
    }
  }
}

@media (min-width: 80rem) {
  #home-page {
    .hero {
      .hero-title {
        font-size: 10rem;

        span {
          font-size: 14rem;
        }
      }

      .cta-container {
        margin-left: 4rem;
      }

      &::after {
        min-height: 40rem;
      }
    }
  }
}
</style>
