<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed } from 'vue';
import { onClickOutside, onKeyStroke } from '@vueuse/core';
import type { DateRangeValue, FilterableColumn, FilterState } from '~/utils/table/query';
import { deriveFilterOptions } from '~/utils/table/query';

const props = withDefaults(
  defineProps<{
    columns: FilterableColumn<T>[];
    data?: T[];
    modelValue: FilterState<T>;
  }>(),
  { data: () => [] },
);

const emit = defineEmits<{ 'update:modelValue': [value: FilterState<T>] }>();

const open = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);

onClickOutside(panelRef, () => (open.value = false), { ignore: [triggerRef] });
onKeyStroke('Escape', () => (open.value = false));

const optionsByColumn = computed(() => {
  const map = new Map<keyof T, { label: string; value: string }[]>();
  for (const column of props.columns) {
    if (column.type === 'date') continue;
    map.set(column.key, column.options ?? deriveFilterOptions(props.data, column.key));
  }
  return map;
});

function isChecked(key: keyof T, value: string) {
  const val = props.modelValue[key];
  return val instanceof Set ? val.has(value) : false;
}

function toggleValue(key: keyof T, value: string) {
  const next: FilterState<T> = { ...props.modelValue };
  const existing = next[key];
  const current = new Set(existing instanceof Set ? existing : []);

  current.has(value) ? current.delete(value) : current.add(value);

  if (current.size) next[key] = current;
  else delete next[key];

  emit('update:modelValue', next);
}

function clearAll() {
  emit('update:modelValue', {});
  open.value = false;
}

function isDateRange(value: unknown): value is DateRangeValue {
  return !!value && typeof value === 'object' && !(value instanceof Set);
}

const activeCount = computed(() =>
  Object.values(props.modelValue).reduce((total: number, val) => {
    if (val instanceof Set) return total + val.size;
    if (isDateRange(val)) return total + (val?.from || val?.to ? 1 : 0);
    return total;
  }, 0),
);

function countFor(key: keyof T) {
  const val = props.modelValue[key];
  if (val instanceof Set) return val.size;
  if (isDateRange(val)) return val.from || val.to ? 1 : 0;
  return 0;
}

function dateRangeFor(key: keyof T): DateRangeValue {
  const val = props.modelValue[key];
  return isDateRange(val) ? val : {};
}

function updateDateRange(key: keyof T, patch: Partial<DateRangeValue>) {
  const next: FilterState<T> = { ...props.modelValue };
  const merged = { ...dateRangeFor(key), ...patch };

  if (merged.from || merged.to) next[key] = merged;
  else delete next[key];

  emit('update:modelValue', next);
}
</script>

<template>
  <div class="table-filter">
    <button
      ref="triggerRef"
      type="button"
      class="table-control-trigger"
      :class="{ active: activeCount > 0 }"
      @click="open = !open"
    >
      <IconFilter :size="16" :strokeWidth="2" />
      <span>Filteren</span>
      <span v-if="activeCount" class="badge">{{ activeCount }}</span>
    </button>

    <div v-if="open" ref="panelRef" class="table-control-panel" role="menu">
      <details v-for="column in columns" :key="String(column.key)" class="filter-group">
        <summary>
          <span>{{ column.label }}</span>
          <span v-if="countFor(column.key)" class="badge small">{{ countFor(column.key) }}</span>
        </summary>

        <div v-if="column.type === 'date'" class="filter-date-range">
          <label>Van</label>
          <input
            type="date"
            :value="dateRangeFor(column.key).from"
            @change="
              updateDateRange(column.key, {
                from: ($event.target as HTMLInputElement).value || undefined,
              })
            "
          />
          <label>Tot</label>
          <input
            type="date"
            :value="dateRangeFor(column.key).to"
            @change="
              updateDateRange(column.key, {
                to: ($event.target as HTMLInputElement).value || undefined,
              })
            "
          />
        </div>

        <div v-else class="filter-options">
          <label
            v-for="opt in optionsByColumn.get(column.key)"
            :key="opt.value"
            class="filter-option"
          >
            <input
              type="checkbox"
              :checked="isChecked(column.key, opt.value)"
              @change="toggleValue(column.key, opt.value)"
            />
            <span>{{ opt.label }}</span>
          </label>
          <p v-if="!optionsByColumn.get(column.key)?.length" class="empty">Geen opties</p>
        </div>
      </details>

      <button v-if="activeCount" type="button" class="clear-btn" @click="clearAll">
        Filters wissen
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-filter {
  position: relative;
  display: inline-block;
}

.table-control-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--secondary-20);
  border-radius: 0.5rem;
  background: var(--primary);
  color: var(--secondary);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 3%;
  cursor: pointer;
  height: 100%;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.1rem;
  height: 1.1rem;
  padding: 0 0.3rem;
  border-radius: 999px;
  background: var(--accent);
  color: var(--primary);
  font-size: 0.68rem;
  font-weight: 700;

  &.small {
    background: var(--secondary-20);
    color: var(--secondary);
  }
}

.table-control-panel {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 30;
  min-width: 15rem;
  max-height: 70vh;
  overflow-y: auto;
  margin-top: 0.2rem;
  padding: 0.25rem;
  padding-right: 0.5rem;
  background: var(--primary);
  border: 1px solid var(--secondary-20);
  border-radius: 0.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.filter-group {
  border-bottom: 1px solid var(--secondary-10);

  &:last-of-type {
    border-bottom: none;
  }

  summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem;
    list-style: none;
    cursor: pointer;
    font-size: 0.82rem;
    color: var(--secondary);

    &::-webkit-details-marker {
      display: none;
    }

    &::after {
      content: '';
      width: 0.5rem;
      height: 0.5rem;
      margin-left: auto;
      border-right: 2px solid var(--gray-700);
      border-bottom: 2px solid var(--gray-700);
      transform: rotate(45deg);
      transition: transform 0.12s ease;
    }
  }

  &[open] summary::after {
    transform: rotate(-135deg);
  }
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0 0.5rem 0.5rem 0.75rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  font-size: 0.8rem;
  color: var(--secondary);
  cursor: pointer;

  input {
    accent-color: var(--accent);
  }
}

.filter-date-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  align-items: center;
  padding: 0 0.5rem 0.5rem 0.75rem;

  label {
    font-size: 0.8rem;
  }

  input {
    font-family: 'DM Sans';
    display: flex;
    width: 100%;
    padding: 0.15rem 0.3rem;
    border: 1px solid var(--secondary-10);
    border-radius: 0.4rem;
    font-size: 0.9rem;
    letter-spacing: 3%;
    background: var(--secondary-10);
    color-scheme: light;

    @media (prefers-color-scheme: dark) {
      color-scheme: dark;
    }
  }
}

.empty {
  font-size: 0.78rem;
  color: var(--gray-700);
  padding: 0.25rem 0;
}

.clear-btn {
  width: 100%;
  margin-top: 0.4rem;
  padding: 0.4rem;
  border: none;
  border-top: 1px solid var(--secondary-10);
  background: transparent;
  font-size: 0.78rem;
  color: var(--gray-700);
  cursor: pointer;
}
</style>
