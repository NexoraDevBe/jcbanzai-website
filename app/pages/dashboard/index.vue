<script setup lang="ts">
import { useOverviewStore } from '~/stores/overview';

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
});

const overviewStore = useOverviewStore();

const newMembersMode = ref<'week' | 'maand'>('week');

onMounted(async () => {
  await Promise.all([overviewStore.fetchNewMembersCount(), overviewStore.fetchMembersHistory()]);
});

const changeNewMembersMode = () => {
  newMembersMode.value = newMembersMode.value === 'week' ? 'maand' : 'week';
};
</script>

<template>
  <main id="dashboard-page">
    <h1>Dashboard overzicht</h1>
    <section>
      <MoleculeGraphCard
        :title="'Nieuwe leden'"
        :value="overviewStore.newMembersCount"
        :data="
          newMembersMode === 'week'
            ? overviewStore.groupByWeek(overviewStore.membersHistory)
            : overviewStore.groupByMonth(overviewStore.membersHistory)
        "
        :mode="newMembersMode"
        @changeMode="changeNewMembersMode"
      />
    </section>
  </main>
</template>

<style scoped lang="scss">
#dashboard-page {
  h1 {
    font-size: 3rem;
  }

  section {
    display: grid;
    grid-template-columns: repeat(4, minmax(20rem, 1fr));
    gap: 1rem;
  }
}
</style>
