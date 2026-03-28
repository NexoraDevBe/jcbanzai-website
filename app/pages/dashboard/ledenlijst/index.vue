<script setup lang="ts">
import { useMembersStore } from '~/stores/members'
import { useUserStore } from '~/stores/user'
import { countries } from 'countries-list'
import {getMembers, type MemberQueryParams, type MemberQueryResult} from "~/utils/supabase";
import type { Column } from '~/types'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})

const userStore = useUserStore()
const membersStore = useMembersStore()

// Fetch members on mount
onMounted(async () => {
  await Promise.all([
    membersStore.fetchMembers(),
    membersStore.fetchFilterOptions(), // one-time, populates checkboxes
  ])
})

// Country options
const countryOptions = Object.entries(countries).map(([key, c]) => ({
  value: key,
  label: c.name
}))

const grades = [
  { value: '01-Beginner', label: 'Beginner' },
  { value: '02-Kyu 6', label: '6e Kyu' },
  { value: '03-Kyu 5', label: '5e Kyu' },
  { value: '04-Kyu 4', label: '4e Kyu' },
  { value: '05-Kyu 3', label: '3e Kyu' },
  { value: '06-Kyu 2', label: '2e Kyu' },
  { value: '07-Kyu 1', label: '1e Kyu' },
  { value: '08-Dan 1', label: '1e Dan' },
  { value: '09-Dan 2', label: '2e Dan' },
  { value: '10-Dan 3', label: '3e Dan' },
  { value: '11-Dan 4', label: '4e Dan' },
  { value: '12-Dan 5', label: '5e Dan' },
  { value: '13-Dan 6', label: '6e Dan' },
  { value: '14-Dan 7', label: '7e Dan' },
  { value: '15-Dan 8', label: '8e Dan' },
  { value: '16-Dan 9', label: '9e Dan' },
  { value: '17-Dan 10', label: '10e Dan' },
]

// Determine which fields are disabled per row
const isFieldDisabled = (fieldKey: string) => {
  if (fieldKey == 'created_at') {
    return true
  }
  if (userStore.userRole === 'user') {
    switch (fieldKey) {
      case 'Gordel_behaald_op':
      case 'Door_wie_examen':
      case 'Behaald_examen':
      case 'Datum_examen':
        return false
      default:
        return true
    }
  }
  return false
}

const handleDownloadClick = async () => {
  const params: MemberQueryParams = {
    pageSize: 1000,
  }

  const { data, count } = await getMembers(params)

  const date = Date.now()

  downloadCSV(data, date + "-ledenlijst.csv")
}

// Define all columns
const columns = computed(() => [
  { key: 'id', label: 'ID', type: 'readonly', className: 'id', sticky: true },
  { key: 'Actief', label: 'Actief', type: 'checkbox', disabled: () => isFieldDisabled('Actief') },
  { key: 'Vergunning', label: 'Vergunning nr', type: 'text', disabled: () => isFieldDisabled('Vergunning') },
  { key: 'Vergunning_geldig_tot', label: 'Vergunning datum', type: 'date', disabled: () => isFieldDisabled('Vergunning_geldig_tot') },
  { key: 'Voornaam', label: 'Voornaam', type: 'text', disabled: () => isFieldDisabled('Voornaam') },
  { key: 'Naam', label: 'Achternaam', type: 'text', disabled: () => isFieldDisabled('Naam') },
  {
    key: 'Geslacht',
    label: 'Geslacht',
    type: 'select',
    options: [
      { value: 'M', label: 'M' },
      { value: 'V', label: 'V' }
    ],
    disabled: () => isFieldDisabled('Geslacht')
  },
  { key: 'Geboorte_datum', label: 'Geboorte', type: 'date', disabled: () => isFieldDisabled('Geboorte_datum') },
  {
    key: 'Nationaliteit',
    label: 'Nationaliteit',
    type: 'select',
    options: countryOptions,
    disabled: () => isFieldDisabled('Nationaliteit')
  },
  { key: 'Straat', label: 'Straat + nr', type: 'text', className: 'straat', disabled: () => isFieldDisabled('Straat') },
  { key: 'Postcode', label: 'Postcode', type: 'text', disabled: () => isFieldDisabled('Postcode') },
  { key: 'Gemeente', label: 'Gemeente', type: 'text', disabled: () => isFieldDisabled('Gemeente') },
  { key: 'Gsm', label: 'GSM', type: 'text', disabled: () => isFieldDisabled('Gsm') },
  { key: 'Gsm2_Telefoon', label: 'Telefoon', type: 'text', disabled: () => isFieldDisabled('Gsm2_Telefoon') },
  { key: 'Emails', label: 'Emails', type: 'array-text', className: 'emails', disabled: () => isFieldDisabled('Emails') },
  { key: 'In_judovlaanderen', label: 'In JV', type: 'checkbox', disabled: () => isFieldDisabled('In_judovlaanderen') },
  { key: 'Dojos', label: 'Dojo\'s', type: 'array-text', className: 'dojos', disabled: () => isFieldDisabled('Dojos') },
  { key: 'Wedstrijd_training', label: 'Wedstrijd training', type: 'text', disabled: () => isFieldDisabled('Wedstrijd_training') },
  {
    key: 'Graad',
    label: 'Graad',
    type: 'select',
    options: grades,
    disabled: () => isFieldDisabled('Graad')
  },
  { key: 'Gordel_behaald_op', label: 'Gordel behaald op', type: 'date', disabled: () => isFieldDisabled('Gordel_behaald_op') },
  { key: 'Lidgeld_opmerkingen', label: 'Opmerkingen', type: 'text', className: 'opmerkingen', disabled: () => isFieldDisabled('Lidgeld_opmerkingen') },
  { key: 'Behaald_examen', label: 'Examen behaald', type: 'text', disabled: () => isFieldDisabled('Behaald_examen') },
  { key: 'Door_wie_examen', label: 'Examen door', type: 'text', disabled: () => isFieldDisabled('Door_wie_examen') },
  { key: 'Datum_examen', label: 'Examen datum', type: 'date', disabled: () => isFieldDisabled('Datum_examen') },
  { key: 'created_at', label: 'Aangemaakt op', type: 'text', disabled: () => isFieldDisabled('created_at') },
]) as unknown as Column[]
</script>

<template>
  <main id="leden-page">
    <MoleculePageHeader
        title="Ledenlijst"
        :hide-admin-actions="userStore.userRole === 'user'"
    >
      <template #left-actions>
        <button
            @click="membersStore.saveChanges"
            class="warning"
            :disabled="!membersStore.hasUnsavedChanges || membersStore.isSaving"
        >
          {{ membersStore.isSaving ? 'Bezig...' : `Opslaan${membersStore.changedCount > 0 ? ` (${membersStore.changedCount})` : ''}` }}
        </button>
        <button
            @click="handleDownloadClick"
            v-show="userStore.userRole === 'superadmin'"
            class="secondary"
        >
          Download
        </button>
      </template>
      <template #right-actions>
        <button
            :disabled="userStore.userRole === 'user'"
            class="success"
        >
          Toevoegen
        </button>
        <button
            :disabled="userStore.userRole === 'user'"
            class="danger"
        >
          Verwijderen
        </button>
      </template>
    </MoleculePageHeader>

    <section class="data-table-container">
      <div v-show="!membersStore.isLoading" class="pagination">
        <button class="secondary" :disabled="membersStore.currentPage === 1" @click="membersStore.setPage(membersStore.currentPage - 1)">
          <IconChevron class="left" :size="16" :stroke-width="3" :color="'primary'"/>
        </button>
        <span>{{ membersStore.currentPage }} / {{ membersStore.totalPages }} ({{ membersStore.totalCount }} leden)</span>
        <button class="secondary" :disabled="membersStore.currentPage === membersStore.totalPages" @click="membersStore.setPage(membersStore.currentPage + 1)">
          <IconChevron class="right"  :size="16" :stroke-width="3" :color="'primary'"/>
        </button>
      </div>

      <MoleculeDataTable
          v-if="!membersStore.isLoading"
          :columns="columns"
          :data="membersStore.members"
          :filter-items="membersStore.filterItems"
          :sort-key="membersStore.sortKey"
          :sort-order="membersStore.sortOrder"
          :changed-coords="membersStore.changedCoords"
          @sort="membersStore.setSort"
          @filter="membersStore.setFilter"
          @update="membersStore.updateMemberField"
          @add-array-item="membersStore.addArrayItem"
          @remove-array-item="membersStore.removeArrayItem"
      />

      <div class="loading" v-else>Laden...</div>
    </section>
  </main>
</template>

<style scoped lang="scss">
#leden-page {
  margin-bottom: var(--page-margin);

  .loading {
    width: 100%;
    height: 50vh;
    font-size: 1.3rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin: 1rem 0;

    .left {
      transform: rotate(90deg);
    }

    .right {
      transform: rotate(-90deg);
    }
  }
}
</style>