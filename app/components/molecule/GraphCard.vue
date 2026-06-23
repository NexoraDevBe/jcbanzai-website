<script setup lang="ts">
type MonthlyCount = {
  date: string;
  count: number;
};

defineProps<{
  title: string;
  value: string | number;
  data: MonthlyCount[];
  mode: "week" | "maand";
}>();

const emit = defineEmits<{
  changeMode: [];
}>();
</script>

<template>
  <div class="graph-card">
    <div class="card-header">
      <h5>{{ title }}</h5>
      <h5 class="value">{{ value }}</h5>
    </div>
    <div class="card-content">
      <button type="button" class="mode-btn" @click="emit('changeMode')">
        {{ mode }}
      </button>
      <AtomMemberGraph :data="data" :mode="mode" />
    </div>
  </div>
</template>
<style lang="scss">
.graph-card {
  background: var(--secondary-10);
  padding: 1rem;
  backdrop-filter: blur(4px);
  border-radius: 1rem;

  .card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    padding: 0 0.5rem;

    h5 {
      font-size: 1.3rem;
      margin: 0;
    }
  }

  .card-content {
    position: relative;
    background: var(--primary-50);
    border-radius: 0.5rem;

    .mode-btn {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      border: 1px solid var(--gray-500);
      background: var(--primary-50);
      color: var(--secondary);
      font-size: 0.8rem;
      padding: 0.2rem 0.4rem 0.1rem;
      border-radius: 0.5rem;
    }
  }
}
</style>
