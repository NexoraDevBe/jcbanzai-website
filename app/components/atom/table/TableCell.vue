<script setup lang="ts">
defineProps<{ value: string | string[]; className?: string; badge?: string }>();
</script>
<template>
  <div class="cell" :class="[className]">
    <div
      v-if="Array.isArray(value)"
      v-for="item in value"
      :class="[badge ? 'badge-' + badge + '-' + item : '']"
      :key="item"
    >
      {{ item }}
    </div>
    <div v-else :class="[badge ? 'badge-' + badge : '']">{{ value }}</div>
  </div>
</template>
<style lang="scss" scoped>
@mixin badge {
  flex-grow: 1;
  padding: 0 0.3rem;
  border-radius: 0.5rem;
  width: fit-content;
}

.cell {
  display: flex;
  flex-direction: column;
  padding: 0.15rem 0.3rem;
  height: 100%;
  min-height: 1.5rem;
  margin: 1px;
  overflow: hidden;

  .badge- {
    &maandag {
      @include badge;
      background: yellowgreen;
      color: var(--dark);
    }

    &woensdag {
      @include badge;
      background: darkorange;
      color: var(--dark);
    }

    &donderdag {
      @include badge;
      background: steelblue;
      color: var(--light);
    }

    &zondag {
      @include badge;
      background: whitesmoke;
      color: var(--dark);
    }
  }
}
</style>
