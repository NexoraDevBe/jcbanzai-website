<script setup lang="ts">
import type { Column } from "~/types";

interface Props {
  columns: Column[];
  data: any[];
  sortKey: string;
  sortOrder: "asc" | "desc";
  changedCoords: { rowId: number; field: string }[];
  filterItems?: Record<string, any[]>;
  activeFilters?: Record<string, any[]>;
  expandAll?: boolean;
  searchQuery?: string; // active search term from store (for display)
}

const props = defineProps<Props>();

const emit = defineEmits<{
  update: [rowId: number, field: string, value: any, arrayIndex?: number];
  delete: [rowId: number[]];
  sort: [key: string];
  addArrayItem: [rowId: number, field: string];
  removeArrayItem: [rowId: number, field: string, index: number];
  filter: [key: string, items: any[]];
  search: [query: string];
}>();

// ── Filters ────────────────────────────────────────────────────────
const selectedFilters = ref<Record<string, any[]>>({});
const stagedFilters = ref<Record<string, any[]>>({});

function handleFilter(key: string, items: any[]) {
  selectedFilters.value[key] = [...items];
  emit("filter", key, selectedFilters.value[key]);
}

function initColumnFilters(key: string, items: any[]) {
  selectedFilters.value[key] = [...items];
  stagedFilters.value[key] = [...items];
}

watch(
  () => props.activeFilters,
  (newFilterItems) => {
    if (!newFilterItems) return;
    for (const [key, items] of Object.entries(newFilterItems)) {
      initColumnFilters(key, items);
    }
  },
  { immediate: true, deep: true },
);

// ── Changed tracking ───────────────────────────────────────────────
const changedSet = computed(
  () => new Set(props.changedCoords.map((c) => `${c.rowId}-${c.field}`)),
);
const checkIfChanged = (rowId: number, field: string) =>
  changedSet.value.has(`${rowId}-${field}`);

// Stable per-row string used by v-memo — only changes when this specific
// row's changed fields change, so other rows are never re-rendered.
const changedFieldsByRow = computed(() => {
  const map = new Map<number, string>();
  for (const c of props.changedCoords) {
    map.set(c.rowId, (map.get(c.rowId) ?? "") + c.field);
  }
  return map;
});

// ── Row selection ──────────────────────────────────────────────────
const selectedRows = ref<number[]>([]);
const deleteSelected = (rowId: number) => {
  const idx = selectedRows.value.indexOf(rowId);
  if (idx !== -1) selectedRows.value.splice(idx, 1);
  else selectedRows.value.push(rowId);
  emit("delete", selectedRows.value);
};

// ── Handlers ───────────────────────────────────────────────────────
const handleUpdate = (
  rowId: number,
  field: string,
  value: any,
  arrayIndex?: number,
) => emit("update", rowId, field, value, arrayIndex);
const handleAddArrayItem = (rowId: number, field: string) =>
  emit("addArrayItem", rowId, field);
const handleRemoveArrayItem = (rowId: number, field: string, index: number) =>
  emit("removeArrayItem", rowId, field, index);

// ── Server-side search ─────────────────────────────────────────────
// `inputValue` is what the user is typing — never triggers a fetch on its own.
// Fetching only happens on commitSearch() (button click or Enter).
const inputValue = ref(props.searchQuery ?? "");

// Keep input in sync if the store clears/changes the search externally
watch(
  () => props.searchQuery,
  (val) => {
    inputValue.value = val ?? "";
  },
);

function commitSearch() {
  emit("search", inputValue.value.trim());
}

function clearSearch() {
  inputValue.value = "";
  emit("search", "");
}

const hasActiveSearch = computed(() => !!props.searchQuery?.trim());

// ── Mobile columns ─────────────────────────────────────────────────
const mobileColumns = computed(() =>
  props.columns.filter((c) => c.className !== "dnone"),
);

// ── Mobile: sort sheet ─────────────────────────────────────────────
const sortSheetOpen = ref(false);
const sortableColumns = computed(() =>
  props.columns.filter(
    (c) =>
      c.className !== "dnone" &&
      (c.type === "text" ||
        c.type === "readonly" ||
        c.type === "date" ||
        c.type === "textarea"),
  ),
);
const handleMobileSort = (key: string) => {
  emit("sort", key);
  sortSheetOpen.value = false;
};

// ── Mobile: filter sheet with staged apply ─────────────────────────
const filterSheetOpen = ref(false);
const filterableColumns = computed(() =>
  props.columns.filter((c) => props.filterItems?.[c.key]?.length),
);

const filterFormatItem = computed<(item: unknown) => string>(() => (item) => {
  switch (item) {
    case false:
      return "Nee";
    case true:
      return "Ja";
    case "01-Beginner":
      return "Beginner";
    case "02-Kyu 6":
      return "6e Kyu";
    case "03-Kyu 5":
      return "5e Kyu";
    case "04-Kyu 4":
      return "4e Kyu";
    case "05-Kyu 3":
      return "3e Kyu";
    case "06-Kyu 2":
      return "2e Kyu";
    case "07-Kyu 1":
      return "1e Kyu";
    case "08-Dan 1":
      return "1e Dan";
    case "09-Dan 2":
      return "2e Dan";
    case "10-Dan 3":
      return "3e Dan";
    case "11-Dan 4":
      return "4e Dan";
    case "12-Dan 5":
      return "5e Dan";
    case "13-Dan 6":
      return "6e Dan";
    case "14-Dan 7":
      return "7e Dan";
    case "15-Dan 8":
      return "8e Dan";
    case "16-Dan 9":
      return "9e Dan";
    case "17-Dan 10":
      return "10e Dan";
    default:
      return String(item);
  }
});

const activeFilterCount = computed(() =>
  filterableColumns.value.reduce((n, col) => {
    const all = props.filterItems?.[col.key] ?? [];
    const active = selectedFilters.value[col.key] ?? all;
    return n + (active.length < all.length ? 1 : 0);
  }, 0),
);

function toggleStagedChip(key: string, item: any) {
  const all = props.filterItems?.[key] ?? [];
  const current = stagedFilters.value[key] ?? [...all];
  if (current.includes(item)) {
    stagedFilters.value[key] = current.filter((i) => i !== item);
  } else {
    stagedFilters.value[key] = [...current, item];
  }
}

function isStagedActive(key: string, item: any): boolean {
  const all = props.filterItems?.[key] ?? [];
  return (stagedFilters.value[key] ?? all).includes(item);
}

function openFilterSheet() {
  for (const key of Object.keys(selectedFilters.value)) {
    stagedFilters.value[key] = [...(selectedFilters.value[key] ?? [])];
  }
  filterSheetOpen.value = true;
  sortSheetOpen.value = false;
}

function applyFilters() {
  for (const [key, items] of Object.entries(stagedFilters.value)) {
    selectedFilters.value[key] = [...items];
    emit("filter", key, items);
  }
  filterSheetOpen.value = false;
}

function closeFilterSheet() {
  for (const key of Object.keys(selectedFilters.value)) {
    stagedFilters.value[key] = [...(selectedFilters.value[key] ?? [])];
  }
  filterSheetOpen.value = false;
}
</script>

<template>
  <div class="dt-root">
    <!-- ── Desktop search bar ─────────────────────────────────────── -->
    <div
      v-if="searchQuery !== undefined"
      class="desktop-search-bar desktop-only"
    >
      <div class="search-input-wrap">
        <IconSearch
          :size="15"
          :stroke-width="2"
          color="secondary"
          class="search-icon"
        />
        <input
          v-model="inputValue"
          type="search"
          placeholder="Zoeken..."
          class="search-input"
          :class="{ 'has-active': hasActiveSearch }"
          @keydown.enter="commitSearch"
        />
        <button
          v-if="inputValue"
          class="search-clear"
          title="Wis zoekopdracht"
          @click="clearSearch"
        >
          <IconClose :size="12" :stroke-width="2.5" color="secondary" />
        </button>
      </div>
      <button class="search-submit" @click="commitSearch" title="Zoeken">
        <IconSearch :size="14" :stroke-width="2.5" color="primary" />
        <span>Zoek</span>
      </button>
      <span v-if="hasActiveSearch" class="search-active-label">
        Resultaten voor "{{ searchQuery }}"
        <button class="search-active-clear" @click="clearSearch">
          <IconClose :size="10" :stroke-width="2.5" color="secondary" />
        </button>
      </span>
    </div>

    <!-- ── Mobile toolbar ────────────────────────────────────────── -->
    <div class="mobile-toolbar mobile-only">
      <div class="search-input-container">
        <div v-if="searchQuery !== undefined" class="search-input-wrap">
          <IconSearch
            :size="15"
            :stroke-width="2"
            color="secondary"
            class="search-icon"
          />
          <input
            v-model="inputValue"
            type="search"
            class="search-input"
            :class="{ 'has-active': hasActiveSearch }"
            placeholder="Zoeken..."
            @keydown.enter="commitSearch"
          />
          <button v-if="inputValue" class="search-clear" @click="clearSearch">
            <IconClose :size="12" :stroke-width="2.5" color="secondary" />
          </button>
        </div>

        <button
          v-if="searchQuery !== undefined"
          class="toolbar-btn search-submit-mobile"
          @click="commitSearch"
          title="Zoeken"
        >
          <IconSearch :size="16" :stroke-width="2" color="primary" />
        </button>
      </div>

      <button
        class="toolbar-btn"
        :class="{ active: sortSheetOpen }"
        @click="
          sortSheetOpen = !sortSheetOpen;
          filterSheetOpen = false;
        "
        title="Sorteren"
      >
        <IconSort :size="16" :stroke-width="2" color="secondary" />
        <span>Sorteren</span>
      </button>

      <button
        class="toolbar-btn"
        :class="{
          active: filterSheetOpen,
          'has-filters': activeFilterCount > 0,
        }"
        @click="filterSheetOpen ? closeFilterSheet() : openFilterSheet()"
        title="Filteren"
      >
        <IconFilter :size="16" :stroke-width="2" color="secondary" />
        <span>Filteren</span>
        <span v-if="activeFilterCount > 0" class="filter-badge">{{
          activeFilterCount
        }}</span>
      </button>
    </div>

    <!-- ── Sort sheet ─────────────────────────────────────────────── -->
    <Transition name="sheet">
      <div v-if="sortSheetOpen" class="inline-sheet mobile-only">
        <div class="sheet-header">
          <span>Sorteren op</span>
          <button class="sheet-close" @click="sortSheetOpen = false">
            <IconClose :size="14" :stroke-width="2" color="secondary" />
          </button>
        </div>
        <div class="sheet-options">
          <button
            v-for="col in sortableColumns"
            :key="col.key"
            class="sheet-pill"
            :class="{ 'sheet-pill--active': sortKey === col.key }"
            @click="handleMobileSort(col.key)"
          >
            {{ col.label }}
            <IconChevron
              v-if="sortKey === col.key"
              :size="10"
              :stroke-width="2.5"
              color="accent"
              :class="{ flip: sortOrder === 'asc' }"
              class="sort-chevron"
            />
          </button>
        </div>
      </div>
    </Transition>

    <!-- ── Filter sheet ───────────────────────────────────────────── -->
    <Transition name="sheet">
      <div v-if="filterSheetOpen" class="inline-sheet mobile-only">
        <div class="sheet-header">
          <span>Filteren</span>
          <button class="sheet-close" @click="closeFilterSheet">
            <IconClose :size="14" :stroke-width="2" color="secondary" />
          </button>
        </div>

        <div class="sheet-body">
          <div
            v-for="col in filterableColumns"
            :key="col.key"
            class="filter-group"
          >
            <p class="filter-group-label">{{ col.label }}</p>
            <div class="filter-chips">
              <button
                v-for="item in filterItems?.[col.key]"
                :key="item"
                class="chip"
                :class="{ 'chip--active': isStagedActive(col.key, item) }"
                @click="toggleStagedChip(col.key, item)"
              >
                {{ filterFormatItem(item) }}
              </button>
            </div>
          </div>
        </div>

        <div class="sheet-footer">
          <button class="btn-apply" @click="applyFilters">Toepassen</button>
        </div>
      </div>
    </Transition>

    <!-- ── Desktop: scrollable table wrapper ──────────────────────── -->
    <div class="table-scroll-wrapper desktop-only">
      <div class="table">
        <div class="table-row header-row">
          <div class="table-cell table-head delete-head" />
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
            :selected-filters="selectedFilters[column.key]"
            @sort="emit('sort', $event)"
            @filter="handleFilter"
          />
        </div>

        <div
          v-for="row in data"
          :key="row.id"
          v-memo="[
            row,
            changedFieldsByRow.get(row.id),
            selectedRows.includes(row.id),
          ]"
          class="table-row"
          :class="{ 'selected-row': selectedRows.includes(row.id) }"
        >
          <div class="table-cell delete-wrapper">
            <input type="checkbox" @change="deleteSelected(row.id)" />
          </div>
          <MoleculeEditableTableCell
            v-for="column in columns"
            :key="`${row.id}-${column.key}`"
            :value="row[column.key]"
            :type="column.type || 'text'"
            :disabled="column.disabled ? column.disabled(row) : false"
            :class-name="column.className ?? ''"
            :changed="checkIfChanged(row.id, column.key)"
            :options="column.options"
            :expand-all="expandAll"
            @update="
              handleUpdate(
                row.id,
                column.key as string,
                $event.value,
                $event.index,
              )
            "
            @add-array-item="handleAddArrayItem(row.id, column.key as string)"
            @remove-array-item="
              handleRemoveArrayItem(row.id, column.key as string, $event)
            "
          />
        </div>
      </div>
    </div>

    <!-- ── Mobile cards ───────────────────────────────────────────── -->
    <div class="mobile-cards mobile-only">
      <div v-if="data.length === 0" class="no-results">
        <span v-if="hasActiveSearch"
          >Geen resultaten voor "{{ searchQuery }}"</span
        >
        <span v-else>Geen gegevens beschikbaar</span>
      </div>

      <div
        v-for="row in data"
        :key="`card-${row.id}`"
        v-memo="[
          row,
          changedFieldsByRow.get(row.id),
          selectedRows.includes(row.id),
        ]"
        class="card"
        :class="{ 'card--selected': selectedRows.includes(row.id) }"
      >
        <div class="card-header">
          <span class="card-id">#{{ row.id }}</span>
          <input
            type="checkbox"
            class="card-checkbox"
            :checked="selectedRows.includes(row.id)"
            @change="deleteSelected(row.id)"
          />
        </div>

        <div class="card-body">
          <div
            v-for="column in mobileColumns"
            :key="`card-${row.id}-${column.key}`"
            class="card-field"
            :class="{
              'card-field--changed': checkIfChanged(row.id, column.key),
            }"
          >
            <span class="card-label">{{ column.label }}</span>
            <div class="card-value">
              <MoleculeEditableTableCell
                :value="row[column.key]"
                :type="column.type || 'text'"
                :disabled="column.disabled ? column.disabled(row) : false"
                :class-name="column.className ?? ''"
                :changed="checkIfChanged(row.id, column.key)"
                :options="column.options"
                :expand-all="expandAll"
                @update="
                  handleUpdate(
                    row.id,
                    column.key as string,
                    $event.value,
                    $event.index,
                  )
                "
                @add-array-item="
                  handleAddArrayItem(row.id, column.key as string)
                "
                @remove-array-item="
                  handleRemoveArrayItem(row.id, column.key as string, $event)
                "
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* ─── Root ─────────────────────────────────────────────────────────── */
.dt-root {
  position: relative;
  width: 100%;
}

/* ─── Visibility helpers ──────────────────────────────────────────── */
.mobile-only {
  display: none;
}

/* ─── Desktop search bar ──────────────────────────────────────────── */
.desktop-search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--secondary-10);

  .search-active-label {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.78rem;
    color: var(--secondary);
    opacity: 0.65;
    white-space: nowrap;
    padding: 0.2rem 0.5rem;
    border-radius: 2rem;
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);

    .search-active-clear {
      display: flex;
      align-items: center;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      opacity: 0.6;
      &:hover {
        opacity: 1;
      }
    }
  }
}

/* ─── Shared: search input wrap ──────────────────────────────────── */
.search-input-wrap {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;

  .search-icon {
    position: absolute;
    left: 0.55rem;
    pointer-events: none;
    opacity: 0.45;
    flex-shrink: 0;
  }

  .search-input {
    width: 100%;
    padding: 0.4rem 2rem 0.4rem 2rem;
    border: 1px solid var(--secondary-20);
    border-radius: 0.5rem;
    background: var(--gray-100);
    font-size: 0.85rem;
    font-family: system-ui;
    color: var(--secondary);
    outline: none;

    &:focus {
      border-color: var(--accent);
    }
    &.has-active {
      border-color: color-mix(in srgb, var(--accent) 50%, transparent);
    }
    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  .search-clear {
    position: absolute;
    right: 0.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    height: 1.2rem;
    padding: 0.3rem;
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0.5;
    border-radius: 0.25rem;
    &:hover {
      opacity: 1;
      background: var(--secondary-10);
    }
  }
}

/* ─── Search submit button ───────────────────────────────────────── */
.search-submit {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  border: 1px solid var(--accent);
  border-radius: 0.5rem;
  background: var(--accent);
  color: var(--primary);
  font-size: 0.82rem;
  font-weight: 600;
  font-family: system-ui;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
  transition: none;

  &:hover {
    opacity: 0.85;
  }
  &:active {
    opacity: 0.7;
  }
}

/* ─── Table scroll wrapper ────────────────────────────────────────── */
.table-scroll-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 75vh;
  min-height: 60vh;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 1rem;

  background:
    linear-gradient(to right, var(--primary, #fff) 20%, transparent) left
      center / 3rem 100% local no-repeat,
    linear-gradient(to left, var(--primary, #fff) 20%, transparent) right
      center / 3rem 100% local no-repeat,
    linear-gradient(to right, rgba(0, 0, 0, 0.07), transparent) left center /
      1.2rem 100% scroll no-repeat,
    linear-gradient(to left, rgba(0, 0, 0, 0.07), transparent) right center /
      1.2rem 100% scroll no-repeat;

  .table {
    display: table;
    min-width: 100%;

    .table-row {
      display: table-row;
      font-size: 0.9rem;

      .id {
        background-color: var(--gray-100);
      }

      &.selected-row {
        background-color: var(--danger-50);

        .id {
          background-color: var(--danger);
        }
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
          .array-item select,
          .array-horizontal-item select {
            background-color: var(--gray-200);
          }
        }

        &.selected-row {
          background-color: var(--danger-50);

          .id {
            background-color: var(--danger);
          }
        }
      }

      .delete-wrapper {
        display: table-cell;
        text-align: center;
        vertical-align: middle;
        width: 1rem;
        input {
          accent-color: var(--accent);
        }
      }

      .delete-head {
        display: table-cell;
        background: var(--primary);
        position: sticky;
        top: 0;
        left: 0;
        z-index: 2;
      }
    }

    .no-results-row {
      display: table-row;
      span {
        display: table-cell;
        padding: 2rem;
        text-align: center;
        font-size: 0.85rem;
        color: var(--secondary);
        opacity: 0.45;
      }
    }
  }
}

/* ─── Mobile cards ────────────────────────────────────────────────── */
.no-results {
  text-align: center;
  padding: 2rem;
  color: var(--secondary);
  opacity: 0.5;
  font-size: 0.9rem;
}

.card {
  border: 1px solid var(--secondary-20);
  border-radius: 0.75rem;
  margin-bottom: 0.75rem;
  overflow: hidden;
  background: var(--primary);

  &--selected {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 20%, transparent);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    background: var(--gray-100);
    border-bottom: 1px solid var(--secondary-10);

    .card-id {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--secondary);
      font-family: system-ui;
    }

    .card-checkbox {
      accent-color: var(--accent);
    }
  }

  .card-body {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  }

  .card-field {
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid var(--secondary-10);
    border-right: 1px solid var(--secondary-10);
    &:last-child {
      border-bottom: none;
    }
    &--changed {
      background-color: color-mix(in srgb, var(--warning) 10%, transparent);
    }
  }

  .card-label {
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--secondary);
    padding: 0.3rem 0.4rem 0;
    font-family: system-ui;
    opacity: 0.6;
  }

  .card-value {
    flex: 1;
    :deep(.table-cell) {
      display: block;
      border: none;
      min-width: unset;
      width: 100%;
      input[type="text"],
      input[type="date"],
      select {
        min-width: unset;
        width: 100%;
        font-size: 0.85rem;
      }
    }
  }
}

/* ─── Mobile toolbar ──────────────────────────────────────────────── */
.mobile-toolbar {
  display: none;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem;

  .search-input-container {
    grid-column: 1/3;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .toolbar-btn {
    grid-row: 2;
    width: 100%;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.42rem 0.65rem;
    border: 1px solid var(--secondary-20);
    border-radius: 0.5rem;
    background: var(--gray-100);
    font-size: 0.8rem;
    color: var(--secondary);
    white-space: nowrap;
    cursor: pointer;
    transition: none;
    flex-shrink: 0;

    &:hover {
      background: var(--secondary-10);
    }
    &.active {
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
    }
    &.has-filters {
      border-color: var(--warning);
    }

    .filter-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.05rem;
      height: 1.05rem;
      border-radius: 50%;
      background: var(--warning);
      color: var(--secondary);
      font-size: 0.62rem;
      font-weight: 700;
    }
  }

  /* Icon-only search button on mobile */
  .search-submit-mobile {
    width: fit-content;
    padding: 0.42rem 0.5rem;
    background: var(--accent);
    border-color: var(--accent);
    color: var(--secondary);
    transition: none;
    &:hover {
      opacity: 0.85;
      background: var(--accent);
    }
  }
}

/* ─── Inline sheets ───────────────────────────────────────────────── */
.inline-sheet {
  font-family: system-ui;

  background: var(--primary);
  border: 1px solid var(--secondary-20);
  border-radius: 0.75rem;
  margin: 0 0.5rem 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.55rem 0.75rem;
    background: var(--gray-100);
    border-bottom: 1px solid var(--secondary-10);
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--secondary);

    .sheet-close {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.15rem;
      border-radius: 0.3rem;
      opacity: 0.6;
      &:hover {
        opacity: 1;
        background: var(--secondary-10);
      }
    }
  }

  .sheet-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    padding: 0.6rem;
  }

  .sheet-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.28rem 0.65rem;
    border: 1px solid var(--secondary-20);
    border-radius: 2rem;
    background: none;
    font-size: 0.8rem;
    color: var(--secondary);
    cursor: pointer;

    &:hover {
      background: var(--secondary-10);
    }

    &--active {
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      font-weight: 600;
    }

    .sort-chevron {
      &.flip {
        transform: rotate(180deg);
      }
    }
  }

  .sheet-body {
    padding: 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 45vh;
    overflow-y: auto;
  }

  .filter-group-label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--secondary);
    opacity: 0.55;
    margin: 0 0 0.35rem;
  }

  .filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .chip {
    padding: 0.25rem 0.6rem;
    border: 1px solid var(--secondary-20);
    border-radius: 2rem;
    background: none;
    font-size: 0.78rem;
    color: var(--secondary);
    cursor: pointer;

    &:hover {
      background: var(--secondary-10);
    }

    &--active {
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 15%, transparent);
      font-weight: 600;
    }
  }

  .sheet-footer {
    display: flex;
    justify-content: flex-end;
    padding: 0.5rem 0.6rem;
    border-top: 1px solid var(--secondary-10);

    .btn-apply {
      padding: 0.4rem 1.2rem;
      border-radius: 0.5rem;
      border: none;
      background: var(--accent);
      color: var(--secondary);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      &:hover {
        opacity: 0.85;
      }
      &:active {
        opacity: 0.7;
      }
    }
  }
}

/* ─── Transitions ─────────────────────────────────────────────────── */
.sheet-enter-active,
.sheet-leave-active {
  transition:
    opacity 0.15s,
    transform 0.15s;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ─── Mobile breakpoint ───────────────────────────────────────────── */
@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
  .mobile-only {
    display: block;
  }

  .mobile-toolbar {
    display: grid;
    padding: 0.5rem;
  }

  .mobile-cards {
    padding: 0.5rem;
  }
}
</style>
