<script setup lang="ts">
const sponsorItems = [
  // {
  //   path: '/assets/images/cbl-welding.png',
  //   link: 'https://cbl-welding.com/',
  //   name: 'CBL Welding',
  // },
  {
    path: '/assets/images/d-bro.png',
    link: 'https://d-bro.eu/',
    name: 'D-Bro',
  },
  // {
  //   path: '/assets/images/devoldere-advocaten.png',
  //   link: 'https://devoldere.be/',
  //   name: 'Devoldere Advocaten',
  // },
  {
    path: '/assets/images/heyde-jelle.png',
    link: 'https://velit.be/',
    name: 'Heyde Jelle',
  },
  // {
  //   path: '/assets/images/pijpaert.png',
  //   link: 'https://thierrypijpaert.be/',
  //   name: 'Pijpaert',
  // },
  {
    path: '/assets/images/renovatie.png',
    link: 'https://www.goedonderjedak.be/',
    name: 'Renovatie',
  },
];

const navigationLinks = [
  { text: 'Privacy', href: '/pdf/Privacyverklaring.pdf', external: true },
  {
    text: 'Verzekeringsformulier',
    href: '/pdf/OngevalAangifte_Verzekeringsformulier.pdf',
    external: true,
  },
  {
    text: 'Initiatieformulier',
    href: '/pdf/Initiatieformulier.pdf',
    external: true,
  },
  {
    text: 'International Judo Federation',
    href: 'https://www.ijf.org/',
    external: true,
  },
  {
    text: 'Judo Vlaanderen',
    href: 'https://www.judovlaanderen.be/',
    external: true,
  },
  { text: 'Bestuur', href: '/bestuur', external: false },
];

const socialLinks = [
  { name: 'Instagram', href: 'https://www.instagram.com/judoclubbanzai/' },
  { name: 'Facebook', href: 'https://www.facebook.com/judoclubbanzai' },
];

const contactLinks = [
  {
    text: 'Sportdreef 1B, 9890 Gavere',
    href: 'https://maps.app.goo.gl/naJyMZre6dtJk2hQ7',
    external: true,
  },
  {
    text: 'Drapstraat 76, 9810 Nazareth',
    href: 'https://maps.app.goo.gl/Tbbnr8PGE5wXWp5b9',
    external: true,
  },
  {
    text: 'info@judoclubbanzai.be',
    href: 'mailto:info@judoclubbanzai.be',
    external: true,
  },
  {
    text: 'secretaris@judoclubbanzai.be',
    href: 'mailto:secretaris@judoclubbanzai.be',
    external: true,
  },
];

const companyDetails = [
  'Judoclub Banzai vzw',
  "Maatschappelijke zetel: 's Gravenstraat 82, 9810 Nazareth",
  'Ondernemingsnr.: 0725.528.623',
  'RPR afdeling Gent',
  'Rekening nr.: BE14 0682 0310 4283',
];
</script>

<template>
  <footer class="app-footer">
    <MoleculeResponsiveCarousel :items="sponsorItems" gap="2rem" :speed="80">
      <template #default="{ item }">
        <MoleculeSponsorItem :sponsor="item" />
      </template>
    </MoleculeResponsiveCarousel>
    <MoleculeFooterInfo
      :navigation-links="navigationLinks"
      :social-links="socialLinks"
      :contact-links="contactLinks"
      :company-details="companyDetails"
    />
    <div class="small-text">
      <p>©2025</p>
      <p>website by SiteArt.</p>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.app-footer {
  max-width: 1920px;
  margin: 0 auto;
  font-size: 1rem;

  .small-text {
    display: flex;
    justify-content: space-between;
    margin: 0 var(--page-margin) calc(var(--page-margin) / 2);
    padding: 0.5rem 0.5rem 0;
    font-size: 0.8rem;
    color: var(--gray-800);

    p {
      margin: 0;
    }
  }
}
</style>
