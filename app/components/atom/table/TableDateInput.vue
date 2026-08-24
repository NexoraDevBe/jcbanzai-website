<script setup lang="ts" generic="T extends { id: string | number }">
import { vFocus } from '~/directives/vFocus';
const props = defineProps<{
  row: T;
  column: keyof T;
  value: string;
  min?: string;
  max?: string;
  className?: string;
  showWeekday?: boolean;
}>();
const emit = defineEmits<{
  commit: [string];
}>();
const { isEditing, startEdit, cancelEdit, startLoading, isLoading } = useEditableCell<T>();
const editing = computed(() => isEditing(props.row, props.column));
const loading = computed(() => isLoading(props.row, props.column));
const localValue = ref(props.value);
const errorState = ref(false);

const weekdayFormatter = new Intl.DateTimeFormat('nl-BE', { weekday: 'short' });

const displayValue = computed(() => {
  if (!props.value) return '';
  const date = new Date(props.value);
  if (Number.isNaN(date.getTime())) return props.value;
  const formatted = date.toLocaleDateString('nl-BE');
  if (!props.showWeekday) return formatted;
  const weekday = weekdayFormatter.format(date).slice(0, 2);
  return `${weekday} ${formatted}`;
});

const validate = (val: string) => {
  if (val && props.min && val < props.min) return false;
  if (val && props.max && val > props.max) return false;
  return true;
};
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') props.value === localValue.value ? handleCancel() : handleCommit();
  if (event.key === 'Escape') handleCancel();
};
const handleCancel = () => {
  localValue.value = props.value;
  cancelEdit();
  errorState.value = false;
};
const handleCommit = () => {
  if (!validate(localValue.value)) {
    errorState.value = true;
    localValue.value = props.value;
    return;
  }
  startLoading(props.row, props.column);
  emit('commit', localValue.value);
  cancelEdit();
  errorState.value = false;
};
</script>
<template>
  <input
    v-if="editing"
    class="dmsans-500"
    :class="[{ error: errorState }, props.className]"
    v-model="localValue"
    type="date"
    :min="props.min"
    :max="props.max"
    @blur="handleCommit"
    @keydown="handleKeydown"
    @change="handleCommit"
    v-focus
  />
  <AtomTableCell
    v-else
    :value="displayValue"
    @click="startEdit(row, column)"
    :class="props.className"
  />
  <div v-if="loading" class="loadingState" />
</template>

<style scoped lang="scss">
input {
  display: flex;
  width: 100%;
  padding: 0.15rem 0.3rem;
  border: 1px solid var(--secondary-10);
  border-radius: 0.4rem;
  font-size: 0.9rem;
  letter-spacing: 3%;
  background: var(--secondary-10);
  color-scheme: light;

  @media (prefers-color-scheme: dark) {
    color-scheme: dark;
  }
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
