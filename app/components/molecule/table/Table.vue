<script setup lang="ts" generic="T extends { id: string | number }">
import { computed, reactive, ref, watch, type ComponentPublicInstance } from 'vue';
import { useRafFn, useEventListener, useStorage, useMediaQuery } from '@vueuse/core';
import { useVirtualizer } from '@tanstack/vue-virtual';
import type { Option } from '../atom/table/TableSelect.vue';

export type ColumnDef<T> = {
  key: keyof T | 'actions';
  label: string;
  sticky?: boolean;
  type?: 'date';
  sort?: boolean;
  filter?: boolean;
  search?: boolean;
  options?: Option[];
  width?: number;
  minWidth?: number;
  virtual?: boolean;
};

type CellSlots<T> = {
  [K in keyof T as `cell-${string & K}`]?: (props: { row: T; cell: T[K]; key: K }) => any;
} & {
  'cell-actions'?: (props: { row: T; key: 'actions' }) => any;
};

const props = withDefaults(
  defineProps<{
    columns: ColumnDef<T>[];
    data: T[];
    isLoading: boolean;
    storageKey?: string;
    resizable?: boolean;
    reorderable?: boolean;
    estimateRowHeight?: number;
  }>(),
  { estimateRowHeight: 44 },
);

defineSlots<
  CellSlots<T> & {
    default?: (props: { row: T; column: ColumnDef<T> }) => any;
  }
>();

const DEFAULT_WIDTH = 160;
const DEFAULT_MIN_WIDTH = 60;

type SavedLayout = { key: string; width: number }[];

const layout = props.storageKey
  ? useStorage<SavedLayout>(`moleculeTable:${props.storageKey}`, [])
  : ref<SavedLayout>([]);

const columnOrder = ref<string[]>([]);
const columnWidths = reactive<Record<string, number>>({});

function initLayout() {
  const saved = layout.value;
  const savedKeys = saved.map((c) => c.key);
  const propKeys = props.columns.map((c) => String(c.key));

  columnOrder.value = [
    ...savedKeys.filter((k) => propKeys.includes(k)),
    ...propKeys.filter((k) => !savedKeys.includes(k)),
  ];

  for (const column of props.columns) {
    const key = String(column.key);
    const savedWidth = saved.find((c) => c.key === key)?.width;
    columnWidths[key] = savedWidth ?? column.width ?? DEFAULT_WIDTH;
  }
}

initLayout();

watch(
  () => props.columns,
  () => initLayout(),
);

function getCell(row: T, key: ColumnDef<T>['key']) {
  return key in (row as object) ? (row as any)[key] : undefined;
}

function persist() {
  layout.value = columnOrder.value.map((key) => ({
    key,
    width: columnWidths[key] ?? DEFAULT_WIDTH,
  }));
}

const orderedColumns = computed(() =>
  columnOrder.value
    .map((key) => props.columns.find((c) => String(c.key) === key))
    .filter((c): c is ColumnDef<T> => !!c),
);

// --- Resizing ---
const thElements = new Map<string, HTMLElement>();

function setThRef(key: string, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLElement) {
    thElements.set(key, el);
  } else {
    thElements.delete(key);
  }
}

function startResize(key: string, event: PointerEvent) {
  if (!props.resizable) return;
  event.preventDefault();
  event.stopPropagation();

  const el = thElements.get(key);
  const startX = event.clientX;
  const startWidth = columnWidths[key] ?? DEFAULT_WIDTH;
  const minWidth = props.columns.find((c) => String(c.key) === key)?.minWidth ?? DEFAULT_MIN_WIDTH;

  let pendingWidth = startWidth;

  const { pause, resume } = useRafFn(
    () => {
      if (el) el.style.width = `${pendingWidth}px`;
    },
    { immediate: false },
  );

  const stopMove = useEventListener(window, 'pointermove', (e: PointerEvent) => {
    const delta = e.clientX - startX;
    pendingWidth = Math.max(minWidth, Math.round(startWidth + delta));
  });

  const stopUp = useEventListener(window, 'pointerup', () => {
    pause();
    stopMove();
    stopUp();
    columnWidths[key] = pendingWidth;
    persist();
  });

  resume();
}

// --- Reordering ---
const draggedKey = ref<string | null>(null);
const dragOverKey = ref<string | null>(null);

function onDragStart(key: string, event: DragEvent) {
  if (!props.reorderable) return;
  draggedKey.value = key;
  event.dataTransfer?.setData('text/plain', key);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
}

function onDragOver(key: string, event: DragEvent) {
  if (!props.reorderable || !draggedKey.value) return;
  event.preventDefault();
  dragOverKey.value = key;
}

function onDrop(targetKey: string) {
  if (!props.reorderable || !draggedKey.value || draggedKey.value === targetKey) {
    draggedKey.value = null;
    dragOverKey.value = null;
    return;
  }

  const order = [...columnOrder.value];
  const from = order.indexOf(draggedKey.value);
  const to = order.indexOf(targetKey);
  order.splice(from, 1);
  order.splice(to, 0, draggedKey.value);
  columnOrder.value = order;

  draggedKey.value = null;
  dragOverKey.value = null;
  persist();
}

function onDragEnd() {
  draggedKey.value = null;
  dragOverKey.value = null;
}

// --- Virtualization ---
// Only active on the desktop table layout (>=48rem), because that's the only
// breakpoint where `.table-container` is actually the scrolling element.
// On mobile the page itself scrolls (card layout), so there's no scrollTop
// for a virtualizer to track — rows render unvirtualized there.
//
// We deliberately avoid the default absolute-position/translateY row
// technique: with `display: table-row-group` an absolutely positioned row
// drops out of table layout and its cells stop lining up with the header.
// Instead we render only the visible slice of real `.tr`/`.td` rows and use
// two spacer rows (padding-row technique) to represent the offscreen space.

const tableContainerRef = ref<HTMLElement | null>(null);
const isDesktop = useMediaQuery('(min-width: 48rem)');

const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: props.data.length,
    getScrollElement: () => tableContainerRef.value,
    estimateSize: () => props.estimateRowHeight,
    overscan: 10,
    getItemKey: (index: number) => props.data[index]?.id ?? index,
  })),
);

const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems());

const paddingTop = computed(() => {
  if (!isDesktop.value || virtualRows.value.length === 0) return 0;
  return virtualRows.value[0]?.start ?? 0;
});

const paddingBottom = computed(() => {
  if (!isDesktop.value || virtualRows.value.length === 0) return 0;
  const total = rowVirtualizer.value.getTotalSize();
  const lastEnd = virtualRows.value[virtualRows.value.length - 1]?.end ?? 0;
  return total - lastEnd;
});

const rowsToRender = computed(() =>
  isDesktop.value
    ? virtualRows.value.map((vr) => ({ index: vr.index, item: props.data[vr.index]! }))
    : props.data.map((item, index) => ({ index, item })),
);

function measureRow(el: Element | ComponentPublicInstance | null, index: number) {
  if (!isDesktop.value || !(el instanceof HTMLElement)) return;
  el.dataset.index = String(index);
  rowVirtualizer.value.measureElement(el);
}
</script>

<template>
  <div v-if="!isLoading" ref="tableContainerRef" class="table-container">
    <div class="table" role="table">
      <div class="thead" role="rowgroup">
        <div class="tr" role="row">
          <div
            v-for="column in orderedColumns"
            :key="String(column.key)"
            :ref="(el) => setThRef(String(column.key), el)"
            class="th"
            role="columnheader"
            :class="{
              sticky: column.sticky,
              reorderable,
              dragging: draggedKey === String(column.key),
              'drag-over': dragOverKey === String(column.key),
            }"
            :style="{ width: columnWidths[String(column.key)] + 'px' }"
            :draggable="reorderable"
            @dragstart="onDragStart(String(column.key), $event)"
            @dragover="onDragOver(String(column.key), $event)"
            @drop="onDrop(String(column.key))"
            @dragend="onDragEnd"
          >
            <span class="th-label">{{ column.label }}</span>
            <span
              v-if="resizable"
              class="th-resize-handle"
              @pointerdown="startResize(String(column.key), $event)"
            />
          </div>
        </div>
      </div>
      <div class="tbody" role="rowgroup">
        <div
          v-if="paddingTop > 0"
          class="tr spacer-row"
          role="presentation"
          aria-hidden="true"
          :style="{ height: paddingTop + 'px' }"
        />
        <div
          v-for="{ index, item } in rowsToRender"
          :key="item.id"
          :ref="(el) => measureRow(el, index)"
          class="tr"
          :class="{ even: index % 2 === 0, odd: index % 2 !== 0 }"
          role="row"
        >
          <div
            v-for="column in orderedColumns"
            :key="String(column.key)"
            class="td"
            role="cell"
            :data-label="column.label"
            :class="{ sticky: column.sticky }"
          >
            <slot
              :name="`cell-${String(column.key)}` as keyof CellSlots<T> & string"
              :row="item"
              :cell="getCell(item, column.key)"
              :key="column.key"
            >
              {{ getCell(item, column.key) }}
            </slot>
          </div>
        </div>
        <div
          v-if="paddingBottom > 0"
          class="tr spacer-row"
          role="presentation"
          aria-hidden="true"
          :style="{ height: paddingBottom + 'px' }"
        />
      </div>
    </div>
  </div>
  <div v-else class="loading">
    <AtomLoader />
  </div>
</template>

<style scoped lang="scss">
.loading {
  width: 100%;
  height: 50vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.3rem;
}

.table-container {
  width: 100%;
  flex: 1;

  .table {
    width: 100%;
    color: var(--secondary);
    font-size: 0.9rem;
  }

  .thead {
    display: none;
  }

  .tbody {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    .spacer-row {
      display: block;
      padding: 0;
      margin: 0;
      border: none;
      background: transparent;
    }

    .tr {
      background: var(--primary);
      border: 1px solid var(--gray-300);
      border-radius: 0.75rem;
      overflow: hidden;
    }

    .td {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      width: 100%;
      box-sizing: border-box;
      padding: 0.3rem 0.5rem;
      border-bottom: 1px solid var(--gray-200);
      min-height: 2.25rem;

      &::before {
        content: attr(data-label);
        flex: 0 0 auto;
        color: var(--gray-700);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      > * {
        flex: 1 1 auto;
        min-width: 0;
        text-align: right;
        white-space: normal;
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      &:first-child {
        background: var(--accent-10);

        &::before {
          content: none;
        }

        > * {
          text-align: left;
          font-size: 1.05rem;
        }
      }

      &:last-child {
        border-bottom: none;
      }
    }
  }

  @media (min-width: 48rem) {
    overflow: auto;
    border: 1px solid var(--gray-300);
    border-radius: 0.75rem;
    background: var(--primary);

    .table {
      min-width: 720px;
      display: table;
      table-layout: fixed;
      border-collapse: separate;
      border-spacing: 0;
      height: fit-content;
    }

    .thead {
      display: table-header-group;
      position: sticky;
      top: 0;
      z-index: 20;

      .tr {
        display: table-row;
      }

      .th {
        display: table-cell;
        position: sticky;
        top: 0;
        z-index: 5;

        padding: 0.75rem 1rem 0.75rem 0.5rem;
        background: var(--gray-100);
        color: var(--secondary);
        border-right: 1px solid var(--secondary-10);
        border-bottom: 2px solid var(--accent);

        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &.sticky {
          left: 0;
          z-index: 6;
        }

        &.reorderable .th-label {
          cursor: grab;
        }

        &.dragging {
          opacity: 0.4;
        }

        &.drag-over {
          outline: 2px dashed var(--accent);
          outline-offset: -2px;
        }
      }

      .th-label {
        pointer-events: none;
      }

      .th-resize-handle {
        position: absolute;
        top: 0;
        right: 0;
        width: 4px;
        height: 100%;
        cursor: col-resize;
        touch-action: none;
        z-index: 10;

        &:hover,
        &:active {
          background: var(--accent-40);
        }
      }
    }

    .tbody {
      display: table-row-group;
      gap: 0;

      .spacer-row {
        display: table-row;
      }

      .tr {
        display: table-row;
        border: none;
        border-radius: 0;
        overflow: visible;
        background: unset;
        box-shadow: none;
        height: 1px;

        &.odd {
          background: var(--gray-100);

          .td:first-child {
            background: var(--gray-100);
          }
        }

        &.even {
          background: var(--gray-200);

          .td:first-child {
            background: var(--gray-200);
          }
        }

        &:hover {
          background: var(--accent-10);

          .td:first-child,
          .td.sticky {
            background: var(--accent-100);
          }
        }
      }

      .td {
        height: inherit;
        display: table-cell;
        border-bottom: 1px solid transparent;
        vertical-align: middle;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding: 0.2rem;

        > * {
          text-align: left;
        }

        &::before {
          content: none;
        }

        &:first-child {
          font-size: 0.9rem;

          > * {
            text-align: left;
            font-size: 0.9rem;
          }
        }

        &.sticky {
          position: sticky;
          left: 0;
          background: inherit;
          z-index: 2;
        }
      }
    }
  }
}
</style>
