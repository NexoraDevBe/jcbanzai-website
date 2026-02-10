<script setup lang="ts">
import { computed } from 'vue'
import type {Member} from "~/types";

interface Props {
  label: string
  sortKey: string
  currentSortKey: string
  sortOrder: 'asc' | 'desc'
  className?: string
  sticky?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  sort: [key: keyof Member]
}>()

const sortIcon = computed(() => {
  if (props.currentSortKey !== props.sortKey) return '↕'
  return props.sortOrder === 'asc' ? '↑' : '↓'
})
</script>

<template>
  <div
      class="table-cell table-head"
      :class="[className, { sticky }]"
      @click="emit('sort', sortKey as keyof Member)"
  >
    <p>
      {{ label }}
      <span class="sort-icon">{{ sortIcon }}</span>
    </p>
  </div>
</template>

<style scoped lang="scss">
.table-cell.table-head {
  position: sticky;
  top: 0;
  background-color: var(--primary);
  border: 1px solid var(--secondary-10);
  border-bottom: 2px solid var(--secondary-40);
  text-transform: uppercase;
  white-space: nowrap;
  z-index: 1;
  cursor: pointer;
  user-select: none;
  will-change: transform;
  display: table-cell;
  vertical-align: middle;

  &:hover {
    background-color: var(--primary-dark, var(--primary));
  }

  &.sticky {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 2;
  }

  &.dnone {
    display: none;
  }

  p {
    margin: 0;
    padding: .3rem .5rem;
  }

  .sort-icon {
    display: inline-block;
    margin-left: 0.25rem;
    font-size: 0.9em;
    opacity: 0.7;
  }
}
</style>