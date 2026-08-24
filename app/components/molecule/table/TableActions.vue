<script setup lang="ts" generic="T extends { id: number }">
import type { FilterState, SortState } from '~/utils/table/query';
import type { ColumnDef } from './Table.vue';

const props = withDefaults(
  defineProps<{
    columns: ColumnDef<T>[];
    data: T[];
    searchPlaceholder?: string;
    hideSearch?: boolean;
    hideSort?: boolean;
    hideFilter?: boolean;
  }>(),
  {
    hideSearch: false,
    hideSort: false,
    hideFilter: false,
  },
);

const search = defineModel<string>('search', { default: '' });
const sort = defineModel<SortState<T>>('sort', { default: null });
const filters = defineModel<FilterState<T>>('filters', { default: () => ({}) });

const { isDataColumn } = useTable<T>();

const filterableColumns = computed(() =>
  props.columns.filter(isDataColumn).filter((c) => c.filter),
);
const sortableColumns = computed(() => props.columns.filter(isDataColumn).filter((c) => c.sort));
</script>

<template>
  <div class="table-actions">
    <AtomTableSearchField
      v-if="!hideSearch"
      v-model="search"
      :placeholder="searchPlaceholder ?? 'Zoek...'"
      class="search-field"
    />

    <div class="button-container">
      <AtomTableSortButton v-if="!hideSort" v-model="sort" :columns="sortableColumns" />
      <AtomTableFilterButton
        v-if="!hideFilter"
        v-model="filters"
        :columns="filterableColumns"
        :data="data"
      />
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-actions {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  gap: 0.5rem;

  .search-field {
    flex-grow: 1;
  }

  .button-container {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-self: flex-end;
  }
}
</style>
