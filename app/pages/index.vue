<script setup lang="ts">
const router = useRouter();

const cta = () => {
  router.push({path: '/starten'});
}
</script>

<template>
  <main id="home-page">
    <section class="hero">
      <AtomJapaneseText :outline="true" :size="4" :vertical="false">バンザイ</AtomJapaneseText>
      <h1 class="hero-title">Judoclub<br> <span>Banzai</span></h1>
      <AtomCallToAction :on-click="cta">
        Starten?
      </AtomCallToAction>
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
    height: 100dvh;

    .hero-title {
      margin: 0;
      line-height: .8;
      font-size: var(--font-size-8xl);
      font-weight: 400;
      text-transform: uppercase;

      span {
        font-size: var(--font-size-9xl);
      }
    }

    button {
      margin-left: var(--space-4xl);
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
</style>