<script setup lang="ts">
import type { ColumnDef } from '~/components/molecule/table/Table.vue';
import { usePlannings } from '~/composables/planning/usePlannings';
import { PlanningType, PlanningTypeLabel } from '~/utils/enums/planning';
import { formatEnumToOptions } from '~/utils/inputs/formatter';
import { api } from '~/utils/query';
import type { Planning } from '~/utils/query/plannings/get';

definePageMeta({
  middleware: 'auth',
  requiredRole: 'user',
  layout: 'dashboard',
});

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

const selectedMonth = ref<string>(`${year}-${month.toString().padStart(2, '0')}`);

const { data, isLoading, distinctMonthOptions, planningByMonth } = usePlannings();

const safeData = computed(
  () => planningByMonth.value.get(selectedMonth.value ?? `${year}-${month}`) ?? [],
);

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
    options: formatEnumToOptions(PlanningType, PlanningTypeLabel),
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

const generate = () => {
  api.plannings.generate.insert({ year: 2026, month: 9 });
};
</script>

<template>
  <main id="trainers-page">
    <section class="data-table-container">
      <MoleculeTableActions :columns="columns" :data="[]" hideFilter hideSearch hideSort>
        <select v-model="selectedMonth">
          <option v-for="month in distinctMonthOptions" :key="month.value" :value="month.value">
            {{ month.label }}
          </option>
        </select>
        <AtomTableButton @click="generate" :disabled="false" className="danger">
          Generate
        </AtomTableButton>
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
