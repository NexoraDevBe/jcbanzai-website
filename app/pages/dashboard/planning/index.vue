<script setup lang="ts">
import type {Column} from "~/types";

definePageMeta({
  middleware: 'auth',
  requiredRole: 'user',
  layout: 'dashboard',
})

const userStore = useUserStore()
const planningStore = usePlanningStore()
const trainersStore = useTrainersStore()

// Fetch planning on mount
const now = new Date()
const year = now.getFullYear()
const month = now.getMonth() + 1

const trainerOptions = computed(() => {
  const mapped = trainersStore.trainerNames
      .filter((trainer) => trainer.naam && trainer.voornaam)
      .map((trainer) => {
        if (trainer.naam && trainer.voornaam) {
          const lastnameCapital = trainer.naam.split(' ')
              .map((lastname) => lastname.substring(0, 1))
              .join('')
          const name = trainer.voornaam + ' ' + lastnameCapital

          return {
            value: name,
            label: name,
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

const plannedMonths = computed(() => {
  const grouped = planningStore.planning.reduce((acc: any, dm) => {
    const year = dm.day.substring(0, 4)
    const month = dm.day.substring(5, 7)
    const key = `${year}-${month}`

    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(dm)

    return acc
  }, {})

  return Object.entries(grouped)
    .filter((days) => {
      return (days as any).every((dm: any) => {
        return dm.type === 'geen-les'
            ? dm.planning.length <= 1 || dm.planning[0] === ''
            : dm.planning.length > 0 && dm.planning[0] !== ''
      })
    })
    .map(([key, days]) => {
      return {
        year: +key.substring(0, 4),
        month: +key.substring(5, 7)
      }
    })
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
  { key: 'day', label: 'datum', type: 'readonly', className: 'datum', disabled: () => true },
  { key: 'type', label: 'type', type: 'readonly', options: typeOptions, className: 'type', disabled: () => true },
  { key: 'planning', label: 'planning', type: 'array-select-horizontal', options: trainerOptions.value, className: 'planning', disabled: () => true },
  { key: 'beschikbaar', label: 'beschikbaar', type: 'readonly', className: 'dnone', disabled: () => true },
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
</script>

<template>
  <main id="trainers-page">
    <MoleculePageHeader title="Planning">
      <template #left-actions>
        <MoleculeSelectMonth :distinct-months="plannedMonths" :limit-months="true" @selectedMonth="planningStore.fetchPlanningByMonth($event.year, $event.month)" />
      </template>
      <template #right-actions>
        <button
            v-if="userStore.allowAccess('admin')"
            class="success"
            @click="() => navigateTo('/dashboard/planning/create')"
        >
          Maak planning
        </button>
        <button
            class="secondary"
            @click="() => navigateTo('/dashboard/planning/beschikbaarheden')"
        >
          Beschikbaarheden
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
#trainers-page {
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