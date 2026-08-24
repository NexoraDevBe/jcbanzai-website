<script setup lang="ts" generic="T extends { id: string | number }">
const props = defineProps<{
  row: T;
  column: keyof T;
  value: boolean;
}>();

const emit = defineEmits<{
  commit: [boolean];
}>();

const { cancelEdit, startLoading, isLoading } = useEditableCell<T>();
const loading = computed(() => isLoading(props.row, props.column));
const localValue = ref<boolean>(props.value);

const handleCommit = () => {
  startLoading(props.row, props.column);
  emit('commit', localValue.value);
  cancelEdit();
};
</script>

<template>
  <div class="checkbox-container">
    <input class="dmsans-500" v-model="localValue" type="checkbox" @change="handleCommit" />
  </div>
  <div v-show="loading" class="loadingState" />
</template>

<style scoped lang="scss">
.checkbox-container {
  display: flex;
  justify-content: flex-end;
  width: fit-content;
  padding: 0.15rem 0.3rem;
}
.error {
  border: 1px solid var(--danger-70);
  background: var(--danger-40);
}
.loadingState {
  position: absolute;
  inset: 0;
  background: var(--primary-20);
  backdrop-filter: blur(5px);
  z-index: 10;
}
</style>
