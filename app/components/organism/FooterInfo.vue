<script setup lang="ts">
interface Props {
  navigationLinks: Array<{ text: string; href: string; external?: boolean }>
  socialLinks: Array<{ name: string; href: string }>
  contactLinks: Array<{ text: string; href: string; external?: boolean }>
  companyDetails: string[]
}

defineProps<Props>()
</script>

<template>
  <div class="footer-info">
    <MoleculeLinksList :links="navigationLinks" />
    <MoleculeSocialsList :socials="socialLinks" />
    <MoleculeLinksList :links="contactLinks" />
    <MoleculeCompanyInfo :company-details="companyDetails" />
    <div class="small-text">
      <p>©2025</p>
      <p>website by SiteArt.</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.footer-info {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: var(--page-margin);
  padding: 1.5rem;
  border-radius: 1rem;
  background-color: var(--secondary-10);
  backdrop-filter: blur(5px);

  .small-text {
    position: absolute;
    left: 0;
    bottom: -.5rem;
    display: flex;
    justify-content: space-between;
    transform: translateY(100%);
    padding: 0 .5rem;
    width: 100%;
    font-size: 1rem;
    color: var(--gray-800);

    p {
      margin: 0;
    }
  }
}

@media screen and (width >= 640px) {
  .footer-info {
    margin-top: 1.5rem;
    padding: 2rem;
  }
}

@media screen and (width >= 1024px) {
  .footer-info {
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: space-between;
    padding: 2rem 3rem;
  }
}

@media screen and (width >= 1280px) {
  .footer-info {
    flex-wrap: nowrap;
  }
}
</style>