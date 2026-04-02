<script setup lang="ts">
interface Props {
  isLoading: boolean
  currentPage: number
  totalPages: number
  totalCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  up: [page: number ]
  down: [page: number ]
}>()
</script>

<template>
  <div v-show="!isLoading" class="pagination">
    <button class="secondary" :disabled="currentPage === 1" @click="emit('up', currentPage - 1)">
      <IconChevron class="left" :size="16" :stroke-width="3" :color="'primary'"/>
    </button>
    <span>{{ currentPage }} / {{ totalPages }} ({{ totalCount }})</span>
    <button class="secondary" :disabled="currentPage === totalPages" @click="emit('down', currentPage + 1)">
      <IconChevron class="right" :size="16" :stroke-width="3" :color="'primary'"/>
    </button>
  </div>
</template>

<style scoped lang="scss">
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;

  .left {
    transform: rotate(90deg);
  }

  .right {
    transform: rotate(-90deg);
  }
}
</style>