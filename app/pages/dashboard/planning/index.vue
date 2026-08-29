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
const selectedMonth = ref<string>('2026-08');

const { data, isLoading, distinctMonthOptions, planningByMonth } = usePlannings({
  from: selectedMonth.value + '-01',
  to: selectedMonth.value + '-31',
});
const safeData = computed(() => data.value ?? []);

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

const logType = (year: number, month: number) => {
  console.log(planningByMonth.value.get(year + '-' + month));
};

const user = await userStore.getUser();
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
        <select v-model="selectedMonth">
          <option v-for="month in distinctMonthOptions" :key="month.value" :value="month.value">
            {{ month.label }}
          </option>
        </select>
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
          <AtomTableCell className="badge-wrapper">
            <AtomBadge :variant="cell">
              {{ cell }}
            </AtomBadge>
          </AtomTableCell>
        </template>

        <template #cell-day="{ cell }">
          <AtomTableCell :value="formatDateTo(cell, 'MMD')" :badge="cell" />
        </template>

        <template #cell-planning="{ cell }">
          <AtomTableCell className="badge-wrapper">
            <AtomBadge v-for="item in cell.filter(Boolean)" :key="item" variant="default">
              {{ item }}
            </AtomBadge>
          </AtomTableCell>
        </template>
      </MoleculeTable>
    </section>
  </main>
</template>

<style scoped lang="scss">
#trainers-page {
  padding: 4rem 0 calc(var(--page-margin) / 2);
  margin-bottom: 0;
  height: 100dvh;

  .data-table-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 0;
    height: 100%;
  }
}
</style>
