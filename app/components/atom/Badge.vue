<script setup lang="ts">
defineProps<{ variant: string; className?: string }>();

export type BadgeVariants = 'default' | 'success' | 'warning' | 'danger';
</script>
<template>
  <div class="badge" :class="variant">
    <slot />
  </div>
</template>
<style lang="scss" scoped>
.badge {
  // font-size: 0.8rem;
  padding: 0.1rem 0.4rem;
  border-radius: 100px;
  width: fit-content;

  &.default,
  & {
    background-color: var(--gray-300);
    color: var(--secondary);
  }

  &.success {
    background-color: var(--success);
    color: var(--light);
  }

  &.warning {
    background-color: var(--warning);
    color: var(--dark);
  }

  &.danger {
    background-color: var(--danger);
    color: var(--light);
  }

  // WEEKDAYS
  &.maandag {
    background-color: var(--monday);
    color: var(--light);
  }

  &.dinsdag {
    background-color: var(--tuesday);
    color: var(--light);
  }

  &.woensdag {
    background-color: var(--wednesday);
    color: var(--dark);
  }

  &.donderdag {
    background-color: var(--thursday);
    color: var(--dark);
  }

  &.vrijdag {
    background-color: var(--friday);
    color: var(--light);
  }

  &.zaterdag {
    background-color: var(--saturday);
    color: var(--light);
  }

  &.zondag {
    background-color: var(--sunday);
    color: var(--dark);
  }
}
</style>
