<script setup lang="ts">
import { computed } from 'vue'
import type { Member, Planning, Trainer } from "~/types";

interface Props {
  label: string
  sortKey: string
  currentSortKey: string
  sortOrder: 'asc' | 'desc'
  className?: string
  sticky?: boolean
  filterItems?: any[]
  selectedFilters?: any[]
}

const props = defineProps<Props>()

const asc = computed(() => props.sortOrder === 'asc' && props.currentSortKey === props.sortKey)
const desc = computed(() => props.sortOrder === 'desc' && props.currentSortKey === props.sortKey)

const emit = defineEmits<{
  sort: [key: keyof Member | keyof Planning | keyof Trainer ]
  filter: [filterKey: string, items: any[]]
}>()

const showFilterIcon = computed(() => props.filterItems && props.filterItems.length > 0)
const showFilters = ref<boolean>(false)


const pendingFilters = ref<any[] | null>(null)

const handleFilterClick = (item: any) => {
  // Work from pending, or fall back to current selectedFilters / all items
  const base = pendingFilters.value !== null
      ? [...pendingFilters.value]
      : props.selectedFilters
          ? [...props.selectedFilters]
          : [...(props.filterItems ?? [])]

  const index = base.indexOf(item)
  if (index !== -1) {
    base.splice(index, 1)
  } else {
    base.push(item)
  }
  pendingFilters.value = base
}

const handleEmptyClick = () => {
  pendingFilters.value = []
}

const handleFillClick = () => {
  pendingFilters.value = [...(props.filterItems ?? [])]
}

const handleMouseLeave = () => {
  if (pendingFilters.value !== null) {
    emit('filter', props.sortKey, pendingFilters.value)
    pendingFilters.value = null
  }
  showFilters.value = false
}
</script>

<template>
  <div
      class="table-cell table-head"
      :class="[className, { sticky }]"
  >
    <div class="table-head-wrapper">
      <IconSort class="clickable" @click="emit('sort', sortKey as keyof Member)" :stroke-width="2" :color="'secondary'" :size="20" :asc="asc" :desc="desc"/>
      <p>
        {{ label }}
      </p>
      <IconChevron v-if="showFilterIcon" @click="showFilters = !showFilters" class="clickable" :class="{ opened: showFilters }" :stroke-width="3" :color="
  (() => {
    const active = pendingFilters ?? selectedFilters
    return !active || active.length === filterItems!.length || active.length === 0
      ? 'secondary'
      : 'danger'
  })()" :size="12"/>
      <div v-if="filterItems" @mouseleave="handleMouseLeave" class="filter-container" :class="{ visible: showFilters }">
        <label v-for="item in filterItems" :for="item">
          <input @click="handleFilterClick(item)" :checked="(pendingFilters ?? selectedFilters ?? filterItems)?.includes(item)" type="checkbox" :id="item" class="filter-checkbox" />
          {{ item }}
        </label>
        <p><span class="clickable" @click="handleFillClick">Alle {{ filterItems.length }} selecteren</span> - <span class="clickable" @click="handleEmptyClick">wissen</span></p>
      </div>
    </div>
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

  .clickable {
    cursor: pointer;
    user-select: none;
  }

  .opened {
    transform: scaleY(-1);
  }

  .table-head-wrapper {
    position: relative;
    display: grid;
    grid-template-columns: 1.2rem 1fr 1.2rem;
    align-items: center;
    gap: .3rem;
    padding: .3rem;

    p {
      position: relative;
      margin: 0;
      padding-right: .2rem;
      width: fit-content;
    }

    .filter-container {
      position: absolute;
      top: calc(100% + .7rem);
      right: .5rem;
      display: none;
      flex-direction: column;
      gap: .5rem;
      padding: 1rem;
      width: fit-content;
      max-height: 60vh;
      overflow: scroll;
      background: var(--primary-80);
      border-radius: .6rem;
      border: 1px solid var(--secondary-10);
      text-transform: capitalize;

      &.visible {
        display: flex;
      }

      label {
        cursor: pointer;
      }

      p {
        margin-top: 1rem;
        font-size: 1rem;

        span {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>