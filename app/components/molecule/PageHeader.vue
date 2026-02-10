<script setup lang="ts">
interface Props {
  title: string
  hideAdminActions?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="page-header">
    <div class="button-container left">
      <slot name="left-actions" />
    </div>
    <h1>{{ title }}</h1>
    <div class="button-container right" :class="{ hidden: hideAdminActions }">
      <slot name="right-actions" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: end;
  gap: 1rem;
  width: 100%;
  margin: 5rem 0 1rem;

  h1 {
    font-size: 3rem;
    margin: 0;
    white-space: nowrap;
  }

  .button-container {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 1rem;

    &.left {
      justify-content: flex-start;
    }

    &.right {
      justify-content: flex-end;
    }

    &.hidden {
      visibility: hidden;
    }
  }
}
</style>