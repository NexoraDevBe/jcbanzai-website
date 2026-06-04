<script setup lang="ts">
import { useOverviewStore } from "~/stores/overview";

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

const overviewStore = useOverviewStore();

onMounted(async () => {
  await Promise.all([overviewStore.fetchNewMembersCount()]);
});
</script>

<template>
  <main id="dashboard-page">
    <h1>Dashboard overzicht</h1>
    <section>
      <h4>Aantal nieuwe leden {{ overviewStore.newMembersCount }}</h4>
      <div></div>
    </section>
  </main>
</template>

<style scoped lang="scss">
#dashboard-page {
  h1 {
    font-size: 3rem;
  }
}
</style>
