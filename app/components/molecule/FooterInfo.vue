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
  </div>
</template>

<style scoped lang="scss">
.footer-info {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: var(--page-margin);
  margin-bottom: 0;
  padding: 1.5rem;
  border-radius: 1rem;
  background-color: var(--secondary-10);
  backdrop-filter: blur(5px);
  z-index: 1;
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