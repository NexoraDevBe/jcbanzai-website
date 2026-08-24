import type { Column } from '~/types';
<script setup lang="ts">
import type { ColumnDef } from '~/components/molecule/table/Table.vue';
import { usePlannings } from '~/composables/planning/usePlannings';
import type { Planning } from '~/utils/query/plannings/get';

definePageMeta({
  middleware: 'auth',
  requiredRole: 'user',
  layout: 'dashboard',
});

const userStore = useUserStore();
const planningStore = usePlanningStore();
const trainersStore = useTrainersStore();

// Fetch planning on mount
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;

const trainerOptions = computed(() => {
  const mapped = trainersStore.trainerNames
    .filter((trainer) => trainer.naam && trainer.voornaam)
    .map((trainer) => {
      if (trainer.naam && trainer.voornaam) {
        const lastnameCapital = trainer.naam
          .split(' ')
          .map((lastname) => lastname.substring(0, 1))
          .join('');
        const name = trainer.voornaam + ' ' + lastnameCapital;

        return {
          value: name,
          label: name,
        };
      }
      return {
        value: 'NA',
        label: 'NA',
      };
    });

  return [...mapped, { value: '', label: ' ' }];
});

const plannedMonths = computed(() => {
  const grouped = planningStore.planning.reduce((acc: any, dm) => {
    const year = dm.day.substring(0, 4);
    const month = dm.day.substring(5, 7);
    const key = `${year}-${month}`;

    if (!acc[key]) acc[key] = [];
    acc[key].push(dm);

    return acc;
  }, {});

  return Object.entries(grouped)
    .filter(([key, days]) => {
      // destructure the tuple
      return (days as any[]).every((dm: any) => {
        // now dm is a day object
        return dm.type === 'geen-les'
          ? dm.planning.length <= 1 || dm.planning[0] === '' // .length not .length()
          : dm.planning.length > 0 && dm.planning[0] !== ''; // .length not .length()
      });
    })
    .map(([key]) => ({
      year: +key.substring(0, 4),
      month: +key.substring(5, 7),
    }));
});

const typeOptions = [
  { value: 'jeugd', label: 'jeugd' },
  { value: 'volwassenen', label: 'volwassenen' },
  { value: 'wedstrijd', label: 'wedstrijd' },
  { value: 'gezamenlijk', label: 'gezamenlijk' },
  { value: 'kleuters', label: 'kleuters' },
  { value: 'geen-les', label: 'geen les' },
];

const { data, isLoading } = usePlannings();
const safeData = computed(() => data.value ?? []);

console.log(data.value);

const columns = computed<ColumnDef<Planning>[]>(() => [
  {
    key: 'weekday',
    label: 'Dag',
    filter: true,
  },
  {
    key: 'day',
    label: 'Datum',
    type: 'date',
    sticky: true,
    filter: true,
    sort: true,
  },
  {
    key: 'type',
    label: 'Type',
    options: typeOptions,
    filter: true,
    sort: true,
  },
  {
    key: 'planning',
    label: 'Planning',
    filter: true,
    sort: true,
  },
  // {
  //   key: 'beschikbaar',
  //   label: 'Beschikbaar',
  //   filter: true,
  //   sort: true,
  // },
]);

// Fetch planning on mount
onMounted(async () => {
  await Promise.all([
    trainersStore.fetchTrainerNames(),
    planningStore.fetchDistinctMonths(), // must come first (or in parallel)
    planningStore.fetchFilterOptions(),
  ]);
  // now distinctMonths is populated before we check it
  await planningStore.fetchPlanningByMonth(year, month);
});
</script>

<template>
  <main id="trainers-page">
    <!-- <MoleculePageHeader title="Planning">
      <template #left-actions>
        <MoleculeSelectMonth
          :distinct-months="plannedMonths"
          :limit-months="true"
          @selectedMonth="planningStore.fetchPlanningByMonth($event.year, $event.month)"
        />
      </template>
      <template #right-actions>
        <button
          v-if="userStore.allowAccess('admin')"
          class="success"
          @click="() => navigateTo('/dashboard/planning/create')"
        >
          Maak planning
        </button>
        <button class="secondary" @click="() => navigateTo('/dashboard/planning/beschikbaarheden')">
          Beschikbaarheden
        </button>
      </template>
    </MoleculePageHeader> -->

    <section class="data-table-container">
      <MoleculeTableActions :columns="columns" :data="[]" hideFilter hideSearch hideSort>
        <AtomTableButton
          @click="() => navigateTo('/dashboard/planning/create')"
          :disabled="false"
          className="success"
        >
          Planning
        </AtomTableButton>
        <AtomTableButton
          @click="() => navigateTo('/dashboard/planning/beschikbaarheden')"
          :disabled="false"
          className="warning"
        >
          Beschikbaarheden
        </AtomTableButton>
      </MoleculeTableActions>

      <MoleculeTable
        :columns="columns"
        :data="safeData"
        :isLoading="isLoading"
        storage-key="plannings-table"
        resizable
        reorderable
      >
        <template #cell-weekday="{ cell }">
          <AtomTableCell :value="cell" :badge="cell" />
        </template>
      </MoleculeTable>
    </section>

    <!-- <section class="data-table-container">
      <MoleculeDataTable
        v-if="!planningStore.isLoading"
        :columns="columns"
        :data="planningStore.planning"
        :filter-items="planningStore.filterItems"
        :sort-key="planningStore.sortKey"
        :sort-order="planningStore.sortOrder"
        :changed-coords="planningStore.changedCoords"
        @sort="planningStore.setSort"
        @filter="planningStore.setFilter"
        @update="planningStore.updatePlanningField"
        @add-array-item="planningStore.addArrayItem"
        @remove-array-item="planningStore.removeArrayItem"
      />
    </section> -->
  </main>
</template>

<style scoped lang="scss">
#trainers-page {
  padding: 4rem 0 calc(var(--page-margin) / 2);
  margin-bottom: 0;
  height: 100dvh;

  .actions {
    display: flex;
    width: 100%;
    gap: 0.5rem;

    > :first-child {
      flex-grow: 1;
    }
  }

  .data-table-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 0;
    height: 100%;
  }
}
</style>
