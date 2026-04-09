<script setup lang="ts">
import {useNewsStore} from "~/stores/news";
import { useUserStore } from '~/stores/user'
import type { Column } from '~/types'
import {deleteNewspost} from "~/utils/supabase";

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

const columns: Column[] = [
  { key: 'id', label: 'ID', type: 'readonly', className: 'id', sticky: true },
  { key: 'title', label: 'Titel', type: 'text', className: 'title' },
  { key: 'description', label: 'Beschrijving', type: 'textarea', className: 'description' },
  { key: 'date', label: 'Datum', type: 'date', className: 'date' },
  { key: 'img_url', label: 'Foto', type: 'text', className: 'img-url' },
  { key: 'pinned', label: 'Vastgemaakt', type: 'checkbox', className: 'pinned' },
  { key: 'post', label: 'Is post', type: 'checkbox', className: 'post' },
  { key: 'alert', label: 'Is alert', type: 'checkbox', className: 'alert' },
  { key: 'alert_start_date', label: 'Alert start datum', type: 'date', className: 'alert-start-date' },
  { key: 'alert_end_date', label: 'Alert eind datum', type: 'date', className: 'alert-end-date' },
]

const selectedRows = ref<number[]>([])
const handleEmitDelete = (rowId: number[]) => {
  selectedRows.value = rowId
}
const handleDelete = async () => {
  if (selectedRows.value.length <= 0) return
  const answer = window.confirm(
      `Ben je zeker dat je de rij(en) ${selectedRows.value} wilt verwijderen`
  )
  if (answer) {
    for (const id of selectedRows.value) {
      await newsStore.removeNewspost(id)
    }
  }
}
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
            @click="navigateTo('/dashboard/nieuws/create')"
        >
          Toevoegen
        </button>
        <button
            :disabled="disabled || selectedRows.length <= 0"
            class="danger"
            @click="handleDelete"
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
          :search-query="newsStore.searchQuery"
          @sort="newsStore.setSort"
          @search="newsStore.setSearch"
          @filter="newsStore.setFilter"
          @update="newsStore.updateNewspostField"
          @delete="handleEmitDelete"
      />
      <div class="loading" v-else>
        <AtomLoader/>
      </div>
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