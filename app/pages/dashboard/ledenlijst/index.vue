<script setup lang="ts">
import { useMembersStore } from "~/stores/members";
import { useUserStore } from "~/stores/user";
import { countries } from "countries-list";
import { getMembers, type MemberQueryParams } from "~/utils/supabase";
import type { Column } from "~/types";
import { downloadCSV } from "~/utils/files";

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

const userStore = useUserStore();
const membersStore = useMembersStore();

// Fetch members on mount
onMounted(async () => {
  await Promise.all([
    membersStore.fetchMembers(),
    membersStore.fetchFilterOptions(), // one-time, populates checkboxes
  ]);
});

// Country options
const countryOptions = Object.entries(countries).map(([key, c]) => ({
  value: key,
  label: c.name,
}));

const grades = [
  { value: "01-Beginner", label: "Beginner" },
  { value: "02-Kyu 6", label: "6e Kyu" },
  { value: "03-Kyu 5", label: "5e Kyu" },
  { value: "04-Kyu 4", label: "4e Kyu" },
  { value: "05-Kyu 3", label: "3e Kyu" },
  { value: "06-Kyu 2", label: "2e Kyu" },
  { value: "07-Kyu 1", label: "1e Kyu" },
  { value: "08-Dan 1", label: "1e Dan" },
  { value: "09-Dan 2", label: "2e Dan" },
  { value: "10-Dan 3", label: "3e Dan" },
  { value: "11-Dan 4", label: "4e Dan" },
  { value: "12-Dan 5", label: "5e Dan" },
  { value: "13-Dan 6", label: "6e Dan" },
  { value: "14-Dan 7", label: "7e Dan" },
  { value: "15-Dan 8", label: "8e Dan" },
  { value: "16-Dan 9", label: "9e Dan" },
  { value: "17-Dan 10", label: "10e Dan" },
];

// Determine which fields are disabled per row
const isFieldDisabled = (fieldKey: string) => {
  if (userStore.userRole === "user") {
    switch (fieldKey) {
      case "gordel_behaald_op":
      case "door_wie_examen":
      case "behaald_examen":
      case "datum_examen":
        return false;
      default:
        return true;
    }
  }
  return false;
};

const handleDownloadClick = async () => {
  const params: MemberQueryParams = {
    pageSize: 1000,
  };

  const { data } = await getMembers(params);

  const date = Date.now();

  downloadCSV(data, date + "-ledenlijst.csv");
};

// Define all columns
const columns = computed(() => [
  { key: "id", label: "ID", type: "readonly", className: "id", sticky: true },
  {
    key: "created_at",
    label: "Aangemaakt op",
    type: "readonly",
    disabled: () => isFieldDisabled("created_at"),
  },
  {
    key: "opvolging",
    label: "Opvolging",
    type: "textarea",
    className: "description",
    disabled: () => isFieldDisabled("opvolging"),
  },
  {
    key: "actief",
    label: "Actief",
    type: "checkbox",
    disabled: () => isFieldDisabled("actief"),
  },
  {
    key: "vergunning",
    label: "Vergunning nr",
    type: "text",
    disabled: () => isFieldDisabled("vergunning"),
  },
  {
    key: "voornaam",
    label: "Voornaam",
    type: "text",
    disabled: () => isFieldDisabled("voornaam"),
  },
  {
    key: "naam",
    label: "Achternaam",
    type: "text",
    disabled: () => isFieldDisabled("naam"),
  },
  {
    key: "geslacht",
    label: "Geslacht",
    type: "select",
    options: [
      { value: "M", label: "M" },
      { value: "V", label: "V" },
    ],
    disabled: () => isFieldDisabled("geslacht"),
  },
  {
    key: "geboorte_datum",
    label: "Geboorte",
    type: "date",
    disabled: () => isFieldDisabled("geboorte_datum"),
  },
  {
    key: "leeftijd",
    label: "Leeftijd",
    type: "readonly",
    disabled: () => isFieldDisabled("leeftijd"),
  },
  {
    key: "nationaliteit",
    label: "Nationaliteit",
    type: "select",
    options: countryOptions,
    disabled: () => isFieldDisabled("nationaliteit"),
  },
  {
    key: "straat",
    label: "Straat + nr",
    type: "text",
    className: "straat",
    disabled: () => isFieldDisabled("straat"),
  },
  {
    key: "postcode",
    label: "Postcode",
    type: "text",
    disabled: () => isFieldDisabled("postcode"),
  },
  {
    key: "gemeente",
    label: "Gemeente",
    type: "text",
    disabled: () => isFieldDisabled("gemeente"),
  },
  {
    key: "gsm",
    label: "GSM",
    type: "text",
    disabled: () => isFieldDisabled("gsm"),
  },
  {
    key: "telefoon",
    label: "Telefoon",
    type: "text",
    disabled: () => isFieldDisabled("telefoon"),
  },
  {
    key: "emails",
    label: "Emails",
    type: "array-text",
    className: "emails",
    disabled: () => isFieldDisabled("emails"),
  },
  {
    key: "dojos",
    label: "Dojo's",
    type: "array-text",
    className: "dojos",
    disabled: () => isFieldDisabled("dojos"),
  },
  {
    key: "wedstrijd_training",
    label: "Wedstrijd training",
    type: "text",
    disabled: () => isFieldDisabled("wedstrijd_training"),
  },
  {
    key: "graad",
    label: "Graad",
    type: "select",
    options: grades,
    disabled: () => isFieldDisabled("graad"),
  },
  {
    key: "gordel_behaald_op",
    label: "Gordel behaald op",
    type: "date",
    disabled: () => isFieldDisabled("gordel_behaald_op"),
  },
  {
    key: "lidgeld_opmerkingen",
    label: "Opmerkingen",
    type: "text",
    className: "opmerkingen",
    disabled: () => isFieldDisabled("lidgeld_opmerkingen"),
  },
  {
    key: "vergunning_geldig_tot",
    label: "Vergunning datum",
    type: "date",
    disabled: () => isFieldDisabled("vergunning_geldig_tot"),
  },
  {
    key: "updated_at",
    label: "Laatst aangepast",
    type: "readonly",
    disabled: () => isFieldDisabled("updated_at"),
  },
]) as unknown as Column[];

const selectedRows = ref<number[]>([]);
const handleEmitDelete = (rowId: number[]) => {
  selectedRows.value = rowId;
};

const handleDelete = () => {
  if (selectedRows.value.length <= 0) return;
  const answer = window.confirm(
    `Ben je zeker dat je de rij(en) ${selectedRows.value} wilt verwijderen`,
  );
  if (answer) {
    console.log("answer", answer);
    for (const id of selectedRows.value) {
      membersStore.removeMember(id);
    }
  }
};
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
          {{
            membersStore.isSaving
              ? "Bezig..."
              : `Opslaan${membersStore.changedCount > 0 ? ` (${membersStore.changedCount})` : ""}`
          }}
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
          @click="() => navigateTo('/dashboard/ledenlijst/create')"
          class="success"
        >
          Toevoegen {{ userStore.userRole }}
        </button>
        <button
          :disabled="userStore.userRole === 'user' || selectedRows.length <= 0"
          class="danger"
          @click="handleDelete"
        >
          Verwijderen
        </button>
      </template>
    </MoleculePageHeader>

    <section class="data-table-container">
      <MoleculeDataTable
        v-if="!membersStore.isLoading"
        :columns="columns"
        :data="membersStore.members"
        :filter-items="membersStore.filterItems"
        :active-filters="membersStore.activeFilters"
        :sort-key="membersStore.sortKey"
        :sort-order="membersStore.sortOrder"
        :changed-coords="membersStore.changedCoords"
        :search-query="membersStore.searchQuery"
        @sort="membersStore.setSort"
        @filter="membersStore.setFilter"
        @search="membersStore.setSearch"
        @update="membersStore.updateMemberField"
        @add-array-item="membersStore.addArrayItem"
        @remove-array-item="membersStore.removeArrayItem"
        @delete="handleEmitDelete"
      />

      <div v-else class="loading">
        <AtomLoader />
      </div>
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
}
</style>
