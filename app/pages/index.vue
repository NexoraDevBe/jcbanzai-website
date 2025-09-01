<script setup lang="ts">
const router = useRouter();

const cta = () => {
  router.push({path: '/starten'});
}
</script>

<template>
  <main>
    <section class="hero">
      <AtomJapaneseText :outline="true" :size="4" :vertical="false">バンザイ</AtomJapaneseText>
      <h1>Judoclub<br> <span>Banzai</span></h1>
      <AtomCallToAction :on-click="cta">
        Starten?
        <IconArrowExtd :class-name="'fill-light'" :height="24"/>
      </AtomCallToAction>
    </section>
  </main>
</template>

<style scoped lang="scss">
main {
  .hero {
    margin: 5rem 0;
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
  }
}
</style>