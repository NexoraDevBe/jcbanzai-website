<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed } from 'vue';
import { onClickOutside, onKeyStroke } from '@vueuse/core';
import type { SortableColumn, SortState, SortDirection } from '~/utils/table/query';

const props = defineProps<{
  columns: SortableColumn<T>[];
  modelValue: SortState<T>;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: SortState<T>] }>();

const open = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);

onClickOutside(panelRef, () => (open.value = false), { ignore: [triggerRef] });
onKeyStroke('Escape', () => (open.value = false));

const activeLabel = computed(
  () => props.columns.find((c) => c.key === props.modelValue?.key)?.label ?? null,
);

function isActive(key: keyof T, direction: SortDirection) {
  return props.modelValue?.key === key && props.modelValue.direction === direction;
}

function select(key: keyof T, direction: SortDirection) {
  emit('update:modelValue', { key, direction });
  open.value = false;
}

function clear() {
  emit('update:modelValue', null);
  open.value = false;
}
</script>

<template>
  <div class="table-sort">
    <button
      ref="triggerRef"
      type="button"
      class="table-control-trigger"
      :class="{ active: !!modelValue }"
      @click="open = !open"
    >
      <IconSort
        :size="16"
        :strokeWidth="2"
        :asc="modelValue?.direction === undefined ? true : modelValue?.direction === 'asc'"
        :desc="modelValue?.direction === undefined ? true : modelValue?.direction === 'desc'"
      />
      <span>{{ activeLabel ? `Sorteren: ${activeLabel}` : 'Sorteren' }}</span>
    </button>

    <div v-if="open" ref="panelRef" class="table-control-panel" role="menu">
      <div v-for="column in columns" :key="String(column.key)" class="table-sort-row">
        <span class="label">{{ column.label }}</span>
        <span class="dir-buttons">
          <button
            type="button"
            class="dir-btn"
            :class="{ active: isActive(column.key, 'asc') }"
            @click="select(column.key, 'asc')"
          >
            A–Z
          </button>
          <button
            type="button"
            class="dir-btn"
            :class="{ active: isActive(column.key, 'desc') }"
            @click="select(column.key, 'desc')"
          >
            Z–A
          </button>
        </span>
      </div>

      <button v-if="modelValue" type="button" class="clear-btn" @click="clear">
        Sortering wissen
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-sort {
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

.table-control-panel {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 30;
  min-width: 15rem;
  width: max-content;
  margin-top: 0.2rem;
  padding: 0.25rem;
  background: var(--primary);
  border: 1px solid var(--secondary-20);
  border-radius: 0.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.table-sort-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.4rem 0.5rem;
  border-radius: 0.5rem;

  &:hover {
    background: var(--gray-100);
  }

  .label {
    font-size: 0.82rem;
    color: var(--secondary);
    width: 100%;
  }

  .dir-buttons {
    display: flex;
    gap: 0.25rem;
  }

  .dir-btn {
    padding: 0.2rem 0.5rem;
    border: 1px solid var(--secondary-20);
    border-radius: 0.4rem;
    background: var(--gray-100);
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--gray-700);
    cursor: pointer;
    width: max-content;

    &.active {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--primary);
    }
  }
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
