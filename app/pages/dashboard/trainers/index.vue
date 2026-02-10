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

// Fetch planning on mount
onMounted(async () => {
  if (trainersStore.trainerNames.length === 0) {
    await trainersStore.fetchTrainerNames()
  }
  if (planningStore.originalPlanning.length === 0) {
    await planningStore.fetchPlanningByMonth(2025, 11)
  }
})

const years = [
  { value: year - 1, label: year - 1 },
  { value: year, label: year },
  { value: year + 1, label: year + 1 },
]

const months = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Maa' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Okt' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
]

const trainerOptions = computed(() => {
  return trainersStore.trainerNames.map((trainer) => {
    if (trainer.Naam && trainer.Voornaam) {
      const achternaam = trainer.Naam.split(' ')
          .map((deelnaam) => deelnaam.substring(0, 1))
          .join('')

      const naam = trainer.Voornaam + ' ' + achternaam

      console.log(naam)

      return {
        value: naam,
        label: naam,
      }
    }
    return {
      value: '',
      label: '',
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

const columns: Column[] = [
  { key: 'id', label: 'ID', type: 'readonly', className: 'id', sticky: true },
  { key: 'day', label: 'datum', type: 'readonly', className: 'datum', disabled: () => true },
  { key: 'type', label: 'type', type: 'readonly', options: typeOptions, className: 'type', disabled: () => true },
  { key: 'planning', label: 'planning', type: 'array-select', options: trainerOptions.value, className: 'planning', disabled: () => true },
  { key: 'beschikbaar', label: 'beschikbaar', type: 'readonly', className: 'dnone', disabled: () => true },
]
</script>

<template>
  <main id="trainers-page">
    <MoleculePageHeader title="Planning">
      <template #right-actions>
        <button
            v-if="userStore.allowAccess('admin')"
            class="warning"
            @click="() => navigateTo('/dashboard/trainers/planning')"
        >
          Maak planning
        </button>
        <button
            class="secondary"
            @click="() => navigateTo('/dashboard/trainers/beschikbaarheden')"
        >
          Beschikbaarheden
        </button>
      </template>
    </MoleculePageHeader>

    <section class="data-table-container">
      <MoleculeDataTable
          v-if="!planningStore.isLoading"
          :columns="columns"
          :data="planningStore.sortedPlanning"
          :sort-key="planningStore.sortKey"
          :sort-order="planningStore.sortOrder"
          :changed-coords="planningStore.changedCoords"
          @sort="planningStore.setSort"
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