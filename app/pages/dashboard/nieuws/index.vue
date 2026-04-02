<script setup lang="ts">
import {useNewsStore} from "~/stores/news";
import { useUserStore } from '~/stores/user'
import type { Column } from '~/types'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})

const userStore = useUserStore()
const newsStore = useNewsStore()

onMounted(async () => {
  await Promise.all([
    newsStore.fetchNewsposts(),
    newsStore.fetchFilterOptions(),
  ])
})

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
  { key: 'title', label: 'Titel', type: 'text', className: 'title' },
  { key: 'description', label: 'Beschrijving', type: 'text', options: beltOptions, className: 'description' },
  { key: 'date', label: 'Datum', type: 'date', className: 'date' },
  { key: 'img_url', label: 'Foto', type: 'text', options: categoryOptions, className: 'img-url' },
  { key: 'post', label: 'Is post', type: 'checkbox', className: 'post' },
  { key: 'alert', label: 'Is alert', type: 'checkbox', className: 'alert' },
  { key: 'alert_end_date', label: 'Alert eind datum', type: 'date', className: 'alert-end-date' },
]
</script>

<template>
  <main id="newsposts-page">
    <MoleculePageHeader title="Nieuws posts">
      <template #left-actions>
        <button
            @click="newsStore.saveChanges"
            class="warning"
            :disabled="!newsStore.hasUnsavedChanges || newsStore.isSaving || disabled"
        >
          {{ newsStore.isSaving ? 'Bezig...' : `Opslaan${newsStore.changedCount > 0 ? ` (${newsStore.changedCount})` : ''}` }}
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
      <MoleculePaginationNav
          :current-page="newsStore.currentPage"
          :is-loading="newsStore.isLoading"
          :total-count="newsStore.totalCount"
          :total-pages="newsStore.totalPages"
          @up="newsStore.setPage"
          @down="newsStore.setPage"
      />

      <MoleculeDataTable
          v-if="!newsStore.isLoading"
          :columns="columns"
          :data="newsStore.newsposts"
          :filter-items="newsStore.filterItems"
          :active-filters="newsStore.activeFilters"
          :sort-key="newsStore.sortKey"
          :sort-order="newsStore.sortOrder"
          :changed-coords="newsStore.changedCoords"
          @sort="newsStore.setSort"
          @filter="newsStore.setFilter"
          @update="newsStore.updateNewspostField"
      />
      <div class="loading" v-else>Laden...</div>
    </section>
  </main>
</template>

<style scoped lang="scss">
#newsposts-page {
  margin-bottom: var(--page-margin);

  .loading {
    width: 100%;
    height: 50vh;
    font-size: 1.3rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>