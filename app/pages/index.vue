<script setup lang="ts">
const router = useRouter();

const cta = () => {
  router.push({path: '/starten'});
}
</script>

<template>
  <main id="home-page">
    <section class="hero">
      <AtomJapaneseText :outline="true" :size="4" :vertical="false">バーンザイ</AtomJapaneseText>
      <h1 class="hero-title">Judoclub<br> <span>Banzai</span></h1>
      <AtomCallToAction :on-click="cta">
        Starten?
      </AtomCallToAction>
      <AtomScrollIndicator/>
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

      button {
        margin-left: 2rem;
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

      button {
        margin-left: 2rem;
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

      button {
        margin-left: 2rem;
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

      button {
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