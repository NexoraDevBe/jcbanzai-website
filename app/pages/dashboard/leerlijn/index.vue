<script setup lang="ts">
import { useTechniquesStore } from '~/stores/techniques'
import { useUserStore } from '~/stores/user'
import type { Column } from '~/types'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})

const userStore = useUserStore()
const techniquesStore = useTechniquesStore()

// Fetch techniques on mount
await techniquesStore.fetchTechniques()

const disabled = computed(() => userStore.userRole === 'user')

const beltOptions = [
  { value: 'white', label: 'wit' },
  { value: 'yellow', label: 'geel' },
  { value: 'orange', label: 'oranje' },
  { value: 'green', label: 'groen' },
  { value: 'blue', label: 'blauw' },
  { value: 'brown', label: 'bruin' },
  { value: 'black', label: 'zwart' },
  { value: '', label: '/' },
]

const categoryOptions = [
  { value: 'protocol', label: 'protocol' },
  { value: 'val', label: 'val' },
  { value: 'worp', label: 'worp' },
  { value: 'houdgreep', label: 'houdgreep' },
  { value: 'wurging', label: 'wurging' },
  { value: 'klem', label: 'klem' },
  { value: 'kata', label: 'kata' },
]

const columns: Column[] = [
  { key: 'id', label: 'ID', type: 'readonly', className: 'id', sticky: true },
  { key: 'name', label: 'Japanse naam', type: 'text', className: 'name' },
  { key: 'belt', label: 'Gordel', type: 'select', options: beltOptions, className: 'belt' },
  { key: 'category', label: 'Categorie', type: 'select', options: categoryOptions, className: 'category' },
  { key: 'translation', label: 'Vertaling', type: 'text', className: 'translation' },
  { key: 'video', label: 'Video', type: 'text', className: 'video' },
]
</script>

<template>
  <main id="leerlijn-page">
    <MoleculePageHeader title="Leerlijn">
      <template #left-actions>
        <button
            @click="techniquesStore.saveChanges"
            class="warning"
            :disabled="!techniquesStore.hasUnsavedChanges || techniquesStore.isSaving || disabled"
        >
          {{ techniquesStore.isSaving ? 'Bezig...' : `Opslaan${techniquesStore.changedCount > 0 ? ` (${techniquesStore.changedCount})` : ''}` }}
        </button>
      </template>
      <template #right-actions>
        <button
            :disabled="disabled"
            class="success"
        >
          Toevoegen
        </button>
        <button
            :disabled="disabled"
            class="danger"
        >
          Verwijderen
        </button>
      </template>
    </MoleculePageHeader>

    <section class="data-table-container">
      <MoleculeDataTable
          v-if="!techniquesStore.isLoading"
          :columns="columns"
          :data="techniquesStore.sortedTechniques"
          :filter-items="techniquesStore.filterItems"
          :sort-key="techniquesStore.sortKey"
          :sort-order="techniquesStore.sortOrder"
          :changed-coords="techniquesStore.changedCoords"
          @sort="techniquesStore.setSort"
          @filter="techniquesStore.setFilter"
          @update="techniquesStore.updateTechniqueField"
      />
      <div class="loading" v-else>Laden...</div>
    </section>
  </main>
</template>

<style scoped lang="scss">
#leerlijn-page {
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
      background-color: rgba(0, 0, 0, .2);
    }
  }
}
</style>