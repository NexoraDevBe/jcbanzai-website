<script setup lang="ts">
import type { ColumnDef } from '~/components/molecule/table/Table.vue';
import { usePlannings } from '~/composables/planning/usePlannings';
import { PlanningType, PlanningTypeLabel } from '~/utils/enums/planning';
import { formatEnumToOptions } from '~/utils/inputs/formatter';
import type { Planning } from '~/utils/query/plannings/get';
definePageMeta({
  middleware: 'auth',
  requiredRole: 'admin',
  layout: 'dashboard',
});

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
const trainersStore = useTrainersStore();

const allowedMonths = computed(() => {
  const generated = [...distinctMonthOptions.value.map((m) => m.value)];

  for (let i = 1; i <= 12; i++) {
    if (month + i > 12) {
      const ty = year + 1;
      const tm = month + i - 12;

      if (!generated.some((g) => g.year === ty && g.month === tm)) {
        generated.push({ year: ty, month: tm });
      }
    } else {
      if (!generated.some((g) => g.year === year && g.month === month + i)) {
        generated.push({ year, month: month + i });
      }
    }
  }

  return generated;
});

const cMonth = ref<number>();
const cYear = ref<number>();

const setCreateMonth = (year: number, month: number) => {
  cMonth.value = month;
  cYear.value = year;
};

const createMonth = async () => {
  if (cMonth.value && cYear.value) {
    await planningStore.fetchPlanningByMonth(cYear.value, cMonth.value);
    await planningStore.fetchDistinctMonths();
  }
};
</script>

<template>
  <main id="planning-page">
    <button @click="navigateTo('/dashboard/planning')" class="secondary">Terug</button>
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
#planning-page {
  margin-bottom: var(--page-margin);

  .data-table-container {
    position: relative;
    overflow: scroll;
    contain: layout style paint;
    height: 80vh;

    .loading {
      width: 100%;
      height: 100%;
      font-size: 1.3rem;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
