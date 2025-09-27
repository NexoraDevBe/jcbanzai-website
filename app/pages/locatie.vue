<script setup lang="ts">

</script>

<template>
<main id="location-page">
  <h1>Locatie</h1>
  <section>
    <h2>Gavere</h2>
    <div class="iframe-container">
      <AtomJapaneseText class="japanese-text" :size="4" :vertical="false" :outline="true">ゲーバー</AtomJapaneseText>
      <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d80417.39843279273!2d3.537753856115455!3d50.959896264725536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c30d6b88caa597%3A0x91cd87736f7745e0!2sSporthal%20Scaldis!5e0!3m2!1snl!2sbe!4v1758890356192!5m2!1snl!2sbe" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
    <div class="style-element" >
      <AtomJapaneseText :size="5" :vertical="true" :outline="true">ローケーション</AtomJapaneseText>
    </div>
  </section>
  <section>
    <h2>Nazareth</h2>
    <div class="iframe-container">
      <AtomJapaneseText class="japanese-text" :size="4" :vertical="false" :outline="true">ナザレス</AtomJapaneseText>
      <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10052.168434956257!2d3.6098537619418387!3d50.95992570447837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c36d4b6727100d%3A0x642b506101f7541a!2sSporthal%20Nazareth!5e0!3m2!1snl!2sbe!4v1758890332299!5m2!1snl!2sbe" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  </section>
</main>
</template>

<style scoped lang="scss">
#location-page {
  section {
    position: relative;

    .style-element {
      display: none;
    }

    h2 {
      width: 100%;
    }

    .iframe-container {
      position: relative;
      width: 100%;

      iframe {
        width: 100%;
        height: 70vh;
        min-height: 30rem;
        border: none;
        border-radius: 1rem;
      }

      .japanese-text {
        position: absolute;
        left: 100%;
        bottom: 0;
        transform: translateY(50%) translateX(-100%);
      }
    }

    &:nth-of-type(even) {
      h2 {
        text-align: right;
      }

      .iframe-container {
        .japanese-text {
          position: absolute;
          left: 0;
          bottom: 0;
          transform: translateY(50%);
        }
      }
    }
  }
}

@media screen and (width >= 64rem) {
  #location-page {
    section {
      .style-element {
        position: absolute;
        right: 0;
        top: 0;
        display: flex;
        justify-content: center;
        width: 30%;
        padding-left: var(--page-margin);
      }

      h2 {
        width: 70%;
      }

      .iframe-container {
        width: 70%;
      }
    }
  }
}
</style>