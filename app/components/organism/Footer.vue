<script setup lang="ts">
const sponsorItems = [
  { path: '/assets/images/cbl-welding.png', link: 'https://cbl-welding.com/' },
  { path: '/assets/images/d-bro.png', link: 'https://d-bro.eu/' },
  { path: '/assets/images/devoldere-advocaten.png', link: 'https://devoldere.be/' },
  { path: '/assets/images/heyde-jelle.png', link: 'https://velit.be/' },
  { path: '/assets/images/pijpaert.png', link: 'https://thierrypijpaert.be/' },
  { path: '/assets/images/renovatie.png', link: 'https://www.goedonderjedak.be/' },
]
</script>

<template>
<footer>
  <div class="sponsors">
    <div v-for="(s, idx) in sponsorItems" :key="idx">
      <img :src="s.path" alt="sponsor">
      <NuxtLink :to="s.link" target="_blank" external/>
    </div>
  </div>
  <div class="info">
    <ul class="links">
      <li><NuxtLink to="" external>Privacy</NuxtLink></li>
      <li><NuxtLink to="https://www.judovlaanderen.be/clubbeheer/verzekering/" external>Verzekeringsformulier</NuxtLink></li>
      <li><NuxtLink to="" external>Initiatieformulier</NuxtLink></li>
      <li><NuxtLink to="https://www.ijf.org/" external>International Judo Federation</NuxtLink></li>
      <li><NuxtLink to="https://www.judovlaanderen.be/" external>Judo Vlaanderen</NuxtLink></li>
      <li><NuxtLink to="/bestuur">Bestuur</NuxtLink></li>
    </ul>
    <ul class="socials">
      <li>
        <NuxtLink to="https://www.instagram.com/judoclubbanzai/" external>
          <IconInstagram :size="40" :stroke-width="1.5"/>
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="https://www.facebook.com/judoclubbanzai" external>
          <IconFacebook :size="40" :stroke-width="1.5"/>
        </NuxtLink>
      </li>
    </ul>
    <ul class="handy">
      <li><NuxtLink to="https://maps.app.goo.gl/naJyMZre6dtJk2hQ7" external>Sportdreef 1B, 9890 Gavere</NuxtLink></li>
      <li><NuxtLink to="https://maps.app.goo.gl/Tbbnr8PGE5wXWp5b9" external>Drapstraat 76, 9810 Nazareth</NuxtLink></li>
      <li><NuxtLink to="mailto:info@judoclubbanzai.be" external>info@judoclubbanzai.be</NuxtLink></li>
      <li><NuxtLink to="mailto:secretaris@judoclubbanzai.be" external>secretaris@judoclubbanzai.be</NuxtLink></li>
      <li><NuxtLink to="mailto:inschrijvingen.wedstrijden@judoclubbanzai.be" external>inschrijvingen.wedstrijden@judoclubbanzai.be</NuxtLink></li>
    </ul>
    <ul class="important">
      <li>Judoclub Banzai vzw</li>
      <li>Maatschappelijke zetel: 's Gravenstraat 82, 9810 Nazareth</li>
      <li>Ondernemingsnr.: 0725.528.623</li>
      <li>RPR afdeling Gent</li>
      <li>Rekening nr.: BE14 0682 0310 4283</li>
    </ul>
  </div>
</footer>
</template>

<style scoped lang="scss">
footer {
  max-width: 1920px;
  margin: 0 auto;

  .sponsors {
    display: flex;
    justify-content: center;
    gap: 2rem;
    list-style: none;

    div {
      position: relative;
      height: 6rem;

      img {
        height: 100%;
        border-radius: .6rem;
        opacity: .8;
        filter: grayscale(100%);
        transition: filter 300ms ease-in-out, opacity 300ms ease-in-out;
      }

      &:hover {
        img {
          opacity: 1;
          filter: grayscale(0%);
        }
      }

      a {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: .6rem;
        z-index: 0;
        text-decoration: none;
      }
    }
  }

  .info {
    display: flex;
    justify-content: space-between;
    margin: 1.5rem 3rem 3rem;
    padding: 2rem 3rem;
    border-radius: 1rem;
    background-color: var(--secondary-10);
    backdrop-filter: blur(5px);

    ul {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: .2rem;
      margin: 0;
      padding: 0;
      list-style: none;

      li {
        a {
          color: inherit;
          text-decoration: none;
        }
      }
    }
  }
}
</style>