<script setup lang="ts">
import type {Column} from "~/types";

definePageMeta({
  middleware: 'auth',
  requiredRole: 'user',
  layout: 'dashboard',
})

const planningStore = usePlanningStore()
const trainersStore = useTrainersStore()

// Fetch planning on mount
const now = new Date()
const year = now.getFullYear()
const month = now.getMonth() + 1

const trainerOptions = computed(() => {
  const mapped = trainersStore.trainerNames
      .filter((trainer) => trainer.Naam && trainer.Voornaam)
      .map((trainer) => {
        if (trainer.Naam && trainer.Voornaam) {
          const achternaam = trainer.Naam.split(' ')
              .map((deelnaam) => deelnaam.substring(0, 1))
              .join('')
          const naam = trainer.Voornaam + ' ' + achternaam

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

const columns: Column[] = computed(() => [
  { key: 'id', label: 'ID', type: 'readonly', className: 'dnone' },
  { key: 'day', label: 'datum', type: 'readonly', className: 'datum' },
  { key: 'type', label: 'type', type: 'readonly', options: typeOptions, className: 'type', disabled: () => true },
  { key: 'planning', label: 'Planning', type: 'readonly', className: 'dnone', disabled: () => true },
  { key: 'beschikbaar', label: 'Beschikbaar', type: 'array-select-horizontal', options: trainerOptions.value, className: 'beschikbaar' },
]) as unknown as Column[]

// Fetch planning on mount
onMounted(async () => {
  await Promise.all([
    trainersStore.fetchTrainerNames(),
    planningStore.fetchFilterOptions(), // add this
  ])
  if (trainersStore.trainerNames.length === 0) {
    await trainersStore.fetchTrainerNames()
  }
  if (planningStore.originalPlanning.length === 0) {
    await planningStore.fetchPlanningByMonth(year, month)
  }
  else {
    if (planningStore.originalPlanning[0]?.day.substring(0, 4) !== year.toString() || planningStore.originalPlanning[0]?.day.substring(5, 7) !== month.toString()) {
      await planningStore.fetchPlanningByMonth(year, month)
    }
  }
  await planningStore.fetchDistinctMonths()
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
  <main id="beschikbaar-page">
    <MoleculePageHeader title="Beschikbaarheden">
      <template #left-actions>
        <MoleculeSelectMonth :distinct-months="planningStore.distinctMonths" :limit-months="true" @selectedMonth="planningStore.fetchPlanningByMonth($event.year, $event.month)" />
        <button
            @click="planningStore.saveChanges"
            class="warning"
            :disabled="!planningStore.hasUnsavedChanges || planningStore.isSaving"
        >
          {{ planningStore.isSaving ? 'Bezig...' : `Opslaan${planningStore.changedCount > 0 ? ` (${planningStore.changedCount})` : ''}` }}
        </button>
      </template>
      <template #right-actions>
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
#beschikbaar-page {
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