<script setup lang="ts">
import type {Column, Member, Planning, Trainer} from "~/types";

interface Props {
  columns: Column[]
  data: any[]
  sortKey: string
  sortOrder: 'asc' | 'desc'
  changedCoords: {rowId: number, field: string}[]
  filterItems?: Record<string, any[]>
  height?: string
  expandAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: '80vh'
})

const emit = defineEmits<{
  sort: [key: string]
  update: [rowId: number, field: string, value: any, arrayIndex?: number]
  addArrayItem: [rowId: number, field: string]
  removeArrayItem: [rowId: number, field: string, index: number]
  filter: [key: string, items: any[]]
}>()

const handleUpdate = (rowId: number, field: string, value: any, arrayIndex?: number) => {
  emit('update', rowId, field, value, arrayIndex)
}

const handleAddArrayItem = (rowId: number, field: string) => {
  emit('addArrayItem', rowId, field)
}

const handleRemoveArrayItem = (rowId: number, field: string, index: number) => {
  emit('removeArrayItem', rowId, field, index)
}

const handleFilter = (key: string, items: any[]) => {
  emit('filter', key, items)
}

const changedSet = computed(() =>
    new Set(props.changedCoords.map(c => `${c.rowId}-${c.field}`))
)

const checkIfChanged = (rowId: number, field: string) =>
    changedSet.value.has(`${rowId}-${field}`)
</script>

<template>
  <div class="table">
    <!-- Header Row -->
    <div class="table-row header-row">
      <MoleculeSortableTableHead
          v-for="column in columns"
          :key="column.key"
          :label="column.label"
          :sort-key="column.key"
          :current-sort-key="sortKey"
          :sort-order="sortOrder"
          :class-name="column.className"
          :sticky="column.sticky"
          :filter-items="filterItems?.[column.key]"
          @sort="emit('sort', $event)"
          @filter="handleFilter"
      />
    </div>

    <!-- Data Rows -->
    <div
        v-for="row in data"
        :key="row.id"
        class="table-row"
    >
      <MoleculeEditableTableCell
          v-for="column in columns"
          :key="`${row.id}-${column.key}`"
          :value="row[column.key]"
          :type="column.type || 'text'"
          :disabled="column.disabled ? column.disabled(row) : false"
          :class-name="(column.className ? column.className : '')"
          :changed="checkIfChanged(row.id, column.key)"
          :options="column.options"
          :expand-all="expandAll"
          @update="handleUpdate(row.id, column.key as string, $event.value, $event.index)"
          @add-array-item="handleAddArrayItem(row.id, column.key as string)"
          @remove-array-item="handleRemoveArrayItem(row.id, column.key as string, $event)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.data-table-container {
  position: relative;
  overflow: scroll;
  contain: layout style paint;

  .table {
    display: table;
    min-width: 100%;

    .table-row {
      display: table-row;
      font-size: 1.1rem;

      .id {
        background-color: var(--gray-100);
      }

      &:nth-of-type(even):not(.header-row) {
        background-color: var(--secondary-10);

        .id {
          background-color: var(--gray-150);
        }

        :deep(.table-cell) {
          &:has(select),
          select {
            background-color: var(--gray-150);
          }

          .array-item select, .array-horizontal-item select {
            background-color: var(--gray-200);
          }
        }
      }
    }
  }
}
</style>