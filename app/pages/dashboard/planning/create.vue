<script setup lang="ts">
import type {Column} from "~/types";

definePageMeta({
  middleware: 'auth',
  requiredRole: 'admin',
  layout: 'dashboard',
})

const userStore = useUserStore()
const planningStore = usePlanningStore()
const trainersStore = useTrainersStore()

const now = new Date()
const year = now.getFullYear()
const month = now.getMonth() + 1

// Add state for collapse/expand all
const allExpanded = ref(false)

const allowedMonths = computed(() => {
  const generated = [...planningStore.distinctMonths]

  for (let i = 1; i <= 12; i++) {
    if (month + i > 12) {
      const ty = year + 1;
      const tm = (month + i) - 12;

      if (!generated.some(g => g.year === ty && g.month === tm)) {
        generated.push({year: ty, month: tm})
      }
    }
    else {
      if (!generated.some(g => g.year === year && g.month === month + i)) {
        generated.push({year, month: month + i})
      }
    }
  }

  return generated
})

const trainerOptions = computed(() => {
  const mapped = trainersStore.trainerNames
      .filter((trainer) => trainer.naam && trainer.voornaam)
      .map((trainer) => {
        if (trainer.naam && trainer.voornaam) {
          const achternaam = trainer.naam.split(' ')
              .map((deelnaam) => deelnaam.substring(0, 1))
              .join('')
          const naam = trainer.voornaam + ' ' + achternaam

          return {
            value: naam,
            label: naam,
          }
        }
        return {
          value: 'NA',
          label: 'NA',
        }
      })

  return [
    ...mapped,
    { value: '', label: ' ' }
  ]
})

const typeOptions = [
  { value: 'jeugd', label: 'jeugd' },
  { value: 'volwassenen', label: 'volwassenen' },
  { value: 'wedstrijd', label: 'wedstrijd' },
  { value: 'gezamenlijk', label: 'gezamenlijk' },
  { value: 'kleuters', label: 'kleuters' },
  { value: 'geen-les', label: 'geen les' },
]

const columns = computed<Column[]>(() => [
  { key: 'id', label: 'ID', type: 'readonly', className: 'dnone' },
  { key: 'day', label: 'datum', type: 'readonly', className: 'datum' },
  { key: 'type', label: 'type', type: 'select', options: typeOptions, className: 'type' },
  { key: 'planning', label: 'Planning', type: 'array-select', options: trainerOptions.value, className: 'planning' },
  { key: 'beschikbaar', label: 'Beschikbaar', type: 'array-select', options: trainerOptions.value, className: 'beschikbaar' },
])

// Fetch planning on mount
onMounted(async () => {
  await Promise.all([
    trainersStore.fetchTrainerNames(),
    planningStore.fetchDistinctMonths(),  // must come first (or in parallel)
    planningStore.fetchFilterOptions(),
  ])
  // now distinctMonths is populated before we check it
  await planningStore.fetchPlanningByMonth(year, month)
})

onBeforeRouteLeave((to, from, next) => {
  if (planningStore.hasUnsavedChanges) {
    const answer = window.confirm(
        `Je hebt ${planningStore.changedCount} niet-opgeslagen wijzigingen. Weet je zeker dat je wilt vertrekken?`
    )
    if (answer) { planningStore.discardChanges(); next() }
    else next(false)
  } else next()
})

// Toggle all arrays function
const toggleAllArrays = () => {
  allExpanded.value = !allExpanded.value
}

const cMonth = ref<number>()
const cYear = ref<number>()

const setCreateMonth = (year: number, month: number) => {
  cMonth.value = month
  cYear.value = year
}

const createMonth = async () => {
  if (cMonth.value && cYear.value) {
    await planningStore.fetchPlanningByMonth(cYear.value, cMonth.value)
    await planningStore.fetchDistinctMonths()
  }
}
</script>

<template>
  <main id="planning-page">
    <MoleculePageHeader title="Maak planning">
      <template #left-actions>
        <MoleculeSelectMonth :distinct-months="allowedMonths" :limit-years="true" @selectedMonth="planningStore.fetchPlanningByMonth($event.year, $event.month)" />
        <button
            @click="planningStore.saveChanges"
            class="warning"
            :disabled="!planningStore.hasUnsavedChanges || planningStore.isSaving || !userStore.allowAccess('admin')"
        >
          {{ planningStore.isSaving ? 'Bezig...' : `Opslaan${planningStore.changedCount > 0 ? ` (${planningStore.changedCount})` : ''}` }}
        </button>
      </template>
      <template #right-actions>
        <button
            @click="toggleAllArrays"
            class="secondary"
        >
          <IconCollapse v-show="allExpanded" :size="20" :stroke-width="2" :color="'primary'"/>
          <IconExpand v-show="!allExpanded" :size="20" :stroke-width="2" :color="'primary'"/>
        </button>
        <button
            @click="navigateTo('/dashboard/planning')"
            class="secondary"
        >
          Terug
        </button>
      </template>
    </MoleculePageHeader>

    <section class="data-table-container">
      <MoleculeDataTable
          v-if="!planningStore.isLoading"
          :columns="columns"
          :data="planningStore.planning"
          :filter-items="planningStore.filterItems"
          :sort-key="planningStore.sortKey"
          :sort-order="planningStore.sortOrder"
          :changed-coords="planningStore.changedCoords"
          :expand-all="allExpanded"
          @sort="planningStore.setSort"
          @filter="planningStore.setFilter"
          @update="planningStore.updatePlanningField"
          @add-array-item="planningStore.addArrayItem"
          @remove-array-item="planningStore.removeArrayItem"
      />
      <div class="loading" v-else>Laden...</div>
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
      background-color: rgba(0, 0, 0, .1);
    }
  }
}
</style>