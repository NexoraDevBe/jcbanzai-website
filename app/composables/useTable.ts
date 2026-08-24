const loadingCell = ref<string | null>(null);
const editingCell = ref<string | null>(null);

export function useEditableCell<T extends { id: string | number }>() {
  function cellKey(row: T, key: keyof T) {
    return `${row.id}-${String(key)}`;
  }

  function isEditing(row: T, key: keyof T) {
    return editingCell.value === cellKey(row, key);
  }

  function startEdit(row: T, key: keyof T) {
    editingCell.value = cellKey(row, key);
  }

  function cancelEdit() {
    editingCell.value = null;
  }

  function isLoading(row: T, key: keyof T) {
    return loadingCell.value === cellKey(row, key);
  }

  function startLoading(row: T, key: keyof T) {
    loadingCell.value = cellKey(row, key);
  }

  function cancelLoading() {
    loadingCell.value = null;
  }

  function commit<V>(
    row: T,
    key: keyof T,
    value: V,
    onCommit: (row: T, key: keyof T, value: V) => void,
  ) {
    onCommit(row, key, value);
    editingCell.value = null;
  }

  return {
    editingCell,
    loadingCell,
    isEditing,
    startEdit,
    cancelEdit,
    isLoading,
    startLoading,
    cancelLoading,
    commit,
  };
}

export type SortDirection = 'asc' | 'desc';

export type SortableColumn<T> = {
  key: keyof T;
  label: string;
  direction?: SortDirection;
};

import { ref, computed, type Ref } from 'vue';
import type { ColumnDef } from '~/components/molecule/table/Table.vue';
import type { SortState, FilterState } from '~/utils/table/query';
import { applySort, applyFilters, applySearch } from '~/utils/table/query';

export function useTableQuery<T extends { id: number | string }>(
  data: Ref<T[]>,
  options?: { searchKeys?: (keyof T)[] },
) {
  const sort = ref<SortState<T>>(null) as Ref<SortState<T>>;
  const filters = ref<FilterState<T>>({}) as Ref<FilterState<T>>;
  const search = ref('');

  const result = computed(() => {
    let rows = data.value;
    if (options?.searchKeys?.length) rows = applySearch(rows, search.value, options.searchKeys);
    rows = applyFilters(rows, filters.value);
    rows = applySort(rows, sort.value);
    return rows;
  });

  return { sort, filters, search, result };
}

export function useTable<T>() {
  function isDataColumn(c: ColumnDef<T>): c is ColumnDef<T> & { key: keyof T } {
    return c.key !== 'actions';
  }

  return { isDataColumn };
}
