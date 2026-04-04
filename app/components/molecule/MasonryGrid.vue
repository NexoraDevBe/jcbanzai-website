<script setup lang="ts">
const props = defineProps<{
  items: unknown[]
  breakpoints?: { minWidth: number; columns: number }[]
}>()

const defaultBreakpoints = [
  { minWidth: 1280, columns: 4 },
  { minWidth: 1024, columns: 3 },
  { minWidth: 640,  columns: 2 },
  { minWidth: 0,    columns: 1 },
]

const useColumns = (breakpoints: { minWidth: number; columns: number }[]) => {
  const width = ref(import.meta.client ? window.innerWidth : 1280)

  const onResize = () => { width.value = window.innerWidth }

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  return computed(() => {
    const match = [...breakpoints]
        .sort((a, b) => b.minWidth - a.minWidth)
        .find(bp => width.value >= bp.minWidth)

    return match?.columns ?? 1
  })
}

const columns = useColumns(props.breakpoints ?? defaultBreakpoints)

const columnizedItems = computed(() => {
  const cols: unknown[][] = Array.from({ length: columns.value }, () => [])
  props.items.forEach((item, index) => {
    cols[index % columns.value]?.push(item)
  })
  return cols
})
</script>

<template>
  <div class="masonry-container">
    <div v-for="(col, colIndex) in columnizedItems" :key="colIndex" class="masonry-column">
      <div v-for="(item, itemIndex) in col" :key="itemIndex" class="masonry-item">
        <slot :item="item" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.masonry-container {
  display: flex;
  gap: 2rem;
  align-items: flex-start;

  .masonry-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
}
</style>