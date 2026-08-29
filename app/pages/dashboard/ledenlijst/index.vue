<script setup lang="ts">
import { useUserStore } from '~/stores/user';
import { countries } from 'countries-list';
import { downloadExcel } from '~/utils/files';
import { useMembers } from '~/composables/members/useMembers';
import type { ColumnDef } from '~/components/molecule/table/Table.vue';
import type { Member } from '~/utils/query/members/get';
import { type UpsertMember } from '~/utils/query/members/upsert';
import { useMemberMutation } from '~/composables/members/useMemberMutation';
import { InputType } from '~/utils/enums/inputs';
import { Dojo, Geslacht, GeslachtLabel, Graad, GraadLabel } from '~/utils/enums/members';
import { formatEnumToOptions } from '~/utils/inputs/formatter';

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
});

const userStore = useUserStore();
const { upsertMember, upsert, removeMember } = useMemberMutation();
const { isDataColumn } = useTable<Member>();
const { cancelLoading } = useEditableCell<Member>();

const { data, isLoading } = useMembers();
const safeData = computed(() => data.value ?? []);

const countryOptions = computed(() =>
  Object.entries(countries).map(([key, c]) => ({
    value: key,
    label: c.name,
  })),
);

const columns = computed<ColumnDef<Member>[]>(() => [
  {
    key: 'voornaam',
    label: 'Voornaam',
    sticky: true,
    sort: true,
    search: true,
  },
  {
    key: 'naam',
    label: 'Achternaam',
    sort: true,
    search: true,
  },
  {
    key: 'opvolging',
    label: 'Opvolging',
    search: true,
  },
  {
    key: 'actief',
    label: 'Actief',
    filter: true,
  },
  {
    key: 'vergunning',
    label: 'Vergunning nr',
    sort: true,
    search: true,
  },
  {
    key: 'geslacht',
    label: 'Geslacht',
    filter: true,
    options: formatEnumToOptions(Geslacht, GeslachtLabel),
  },
  {
    key: 'geboorte_datum',
    label: 'Geboorte',
    sort: true,
  },
  {
    key: 'leeftijd',
    label: 'Leeftijd',
    filter: true,
  },
  {
    key: 'nationaliteit',
    label: 'Nationaliteit',
    filter: true,
  },
  {
    key: 'straat',
    label: 'Straat + nr',
    search: true,
  },
  {
    key: 'postcode',
    label: 'Postcode',
    filter: true,
  },
  {
    key: 'gemeente',
    label: 'Gemeente',
    filter: true,
    search: true,
  },
  {
    key: 'gsm',
    label: 'GSM',
  },
  {
    key: 'telefoon',
    label: 'Telefoon',
  },
  {
    key: 'emails',
    label: 'Emails',
  },
  {
    key: 'dojos',
    label: "Dojo's",
    filter: true,
    search: true,
  },
  {
    key: 'wedstrijd_training',
    label: 'Wedstrijd training',
    filter: true,
    search: true,
  },
  {
    key: 'graad',
    label: 'Graad',
    sort: true,
    filter: true,
    options: formatEnumToOptions(Graad, GraadLabel),
  },
  {
    key: 'gordel_behaald_op',
    label: 'Gordel behaald op',
    sort: true,
    filter: true,
    type: 'date',
  },
  {
    key: 'lidgeld_opmerkingen',
    label: 'Opmerkingen',
    search: true,
  },
  {
    key: 'vergunning_geldig_tot',
    label: 'Vergunning datum',
    sort: true,
    filter: true,
    type: 'date',
  },
  {
    key: 'updated_at',
    label: 'Laatst aangepast',
    sort: true,
  },
  {
    key: 'created_at',
    label: 'Aangemaakt op',
    sort: true,
  },
  { key: 'actions', label: '', virtual: true, sticky: false, width: 30, minWidth: 30 },
]);
const searchColumns = computed(() =>
  columns.value
    .filter(isDataColumn)
    .filter((c) => c.search)
    .map((c) => c.key),
);

const {
  sort,
  filters,
  search,
  result: filteredData,
} = useTableQuery(safeData, {
  searchKeys: searchColumns.value,
});

const handleDownloadClick = async () => {
  if (!data.value) return;
  const date = Date.now();
  downloadExcel<Member>(data.value, date + '-ledenbestand.xlsx');
};

const onCommit = (
  row: UpsertMember,
  key: keyof UpsertMember,
  value: UpsertMember[keyof UpsertMember],
) => {
  upsertMember(
    { ...row, [key]: value },
    {
      onError: (err) => {
        window.alert(
          'Opslaan mislukt, contacteer Laurens met deze melding: \n\nSave member data: \n' + err,
        );
      },
      onSettled: cancelLoading,
    },
  );
};

const onRemove = (id: number) => {
  removeMember(id, {
    onError: (err) =>
      window.alert(
        'Verwijderen mislukt, contacteer Laurens met deze melding: \n\nDelete member data: \n' +
          err,
      ),
    onSettled: cancelLoading,
  });
};
</script>

<template>
  <main id="leden-page">
    <section class="data-table-container">
      <MoleculeTableActions
        v-model:search="search"
        v-model:sort="sort"
        v-model:filters="filters"
        :columns="columns"
        :data="safeData"
        search-placeholder="Zoek op naam, gemeente..."
      >
        <AtomTableButton
          v-show="userStore.userRole === 'superadmin'"
          @click="handleDownloadClick"
          :disabled="upsert.isPending.value"
        >
          <IconDownload :size="16" :stroke-width="2" color="secondary" />
        </AtomTableButton>
        <AtomTableButton
          @click="() => navigateTo('/dashboard/ledenlijst/create')"
          :disabled="upsert.isPending.value"
          className="success"
        >
          <IconAddCross :size="16" :stroke-width="2" color="secondary" />
          Toevoegen
        </AtomTableButton>
      </MoleculeTableActions>

      <MoleculeTable
        :columns="columns"
        :data="filteredData ?? []"
        :isLoading="isLoading"
        storage-key="members-table"
        resizable
        reorderable
      >
        <template #cell-voornaam="{ row, cell, key }">
          <AtomTableInput
            :loading="upsert.isPending"
            :row="row"
            :column="key"
            :value="cell"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-naam="{ row, cell, key }">
          <AtomTableInput
            :row="row"
            :column="key"
            :value="cell"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-opvolging="{ row, cell, key }">
          <AtomTableTextarea
            :row="row"
            :column="key"
            :value="cell"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-lidgeld_opmerkingen="{ row, cell, key }">
          <AtomTableTextarea
            :row="row"
            :column="key"
            :value="cell"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-created_at="{ cell }">
          <AtomTableCell :value="formatDateTime(cell)" />
        </template>

        <template #cell-updated_at="{ cell }">
          <AtomTableCell :value="formatDateTime(cell)" />
        </template>

        <template #cell-actief="{ row, cell, key }">
          <AtomTableCheckbox
            :row="row"
            :column="key"
            :value="cell"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-vergunning="{ row, cell, key }">
          <AtomTableInput
            :type="InputType.NUMBER"
            :row="row"
            :column="key"
            :value="cell"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-geslacht="{ row, cell, key }">
          <AtomTableSelect
            :row="row"
            :column="key"
            :value="cell"
            :options="formatEnumToOptions(Geslacht, GeslachtLabel)"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-nationaliteit="{ row, cell, key }">
          <AtomTableSelect
            :row="row"
            :column="key"
            :value="cell"
            :options="countryOptions"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-graad="{ row, cell, key }">
          <AtomTableSelect
            :row="row"
            :column="key"
            :value="cell"
            :options="formatEnumToOptions(Graad, GraadLabel)"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-straat="{ row, cell, key }">
          <AtomTableInput
            :row="row"
            :column="key"
            :value="cell"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-postcode="{ row, cell, key }">
          <AtomTableInput
            :row="row"
            :column="key"
            :value="cell"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-gemeente="{ row, cell, key }">
          <AtomTableInput
            :row="row"
            :column="key"
            :value="cell"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-gsm="{ row, cell, key }">
          <AtomTableInput
            :type="InputType.PHONE"
            :row="row"
            :column="key"
            :value="cell"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-telefoon="{ row, cell, key }">
          <AtomTableInput
            :type="InputType.PHONE"
            :row="row"
            :column="key"
            :value="cell"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-wedstrijd_training="{ row, cell, key }">
          <AtomTableInput
            :row="row"
            :column="key"
            :value="cell"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-emails="{ row, cell, key }">
          <AtomTableListInput
            :row="row"
            :column="key"
            :value="cell"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-dojos="{ row, cell, key }">
          <AtomTableMultiSelect
            :row="row"
            :column="key"
            :value="cell"
            :options="formatEnumToOptions(Dojo)"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-geboorte_datum="{ row, cell, key }">
          <AtomTableDateInput
            :row="row"
            :column="key"
            :value="cell"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-gordel_behaald_op="{ row, cell, key }">
          <AtomTableDateInput
            :row="row"
            :column="key"
            :value="cell"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-vergunning_geldig_tot="{ row, cell, key }">
          <AtomTableDateInput
            :row="row"
            :column="key"
            :value="cell"
            @commit="onCommit(row, key, $event)"
          />
        </template>

        <template #cell-actions="{ row, key }">
          <AtomTableDeleteButton
            @delete="onRemove(row.id)"
            :row="{ ...row, actions: key }"
            :column="key"
          />
        </template>
      </MoleculeTable>
    </section>
  </main>
</template>

<style scoped lang="scss">
#leden-page {
  padding: 4rem 0 calc(var(--page-margin) / 2);
  margin-bottom: 0;
  height: 100dvh;

  .data-table-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 0;
    height: 100%;
  }
}
</style>
