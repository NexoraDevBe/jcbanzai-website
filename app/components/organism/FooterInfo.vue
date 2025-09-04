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
  display: flex;
  justify-content: space-between;
  margin: 1.5rem 3rem 3rem;
  padding: 2rem 3rem;
  border-radius: 1rem;
  background-color: var(--secondary-10);
  backdrop-filter: blur(5px);
}
</style>