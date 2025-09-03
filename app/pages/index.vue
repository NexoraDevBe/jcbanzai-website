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
      <h1>Judoclub<br> <span>Banzai</span></h1>
      <AtomCallToAction :on-click="cta">
        Starten?
        <IconArrowExtd :class-name="'fill-light'" :height="24"/>
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
  .hero {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100dvh;

    h1 {
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
      right: -20rem;
      content: '';
      height: 100%;
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