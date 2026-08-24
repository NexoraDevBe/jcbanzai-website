<script setup lang="ts">
defineProps<{ disabled: boolean; className?: string }>();
</script>
<template>
  <button :disabled="disabled" class="table-button" :class="className">
    <slot></slot>
  </button>
</template>
<style scoped lang="scss">
.table-button {
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

  &.success {
    background: var(--success);
    color: var(--light);
  }

  &.danger {
    background: var(--danger);
    color: var(--light);
  }

  &.warning {
    background: var(--warning);
    color: var(--dark);
  }
}
</style>
