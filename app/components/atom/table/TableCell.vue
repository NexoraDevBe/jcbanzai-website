<script setup lang="ts">
defineProps<{ value?: string | string[]; className?: string }>();
</script>
<template>
  <div class="cell" :class="[className]">
    <div v-if="Array.isArray(value)" v-for="item in value" :key="item">
      <span>{{ item }}</span>
    </div>
    <div v-else-if="value">{{ value }}</div>
    <slot v-else />
  </div>
</template>
<style lang="scss" scoped>
.cell {
  display: flex;
  flex-direction: column;
  padding: 0.15rem 0.3rem;
  height: 100%;
  min-height: 1.5rem;
  margin: 1px;
  overflow: hidden;

  &.badge-wrapper {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}
</style>
