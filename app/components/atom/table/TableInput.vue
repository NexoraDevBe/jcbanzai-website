<script setup lang="ts" generic="T extends { id: string | number }">
import { vFocus } from '~/directives/vFocus';
import { InputType } from '~/utils/enums/inputs';
import { formatByType } from '~/utils/inputs/formatter';
import { validateByType } from '~/utils/inputs/validator';

const props = defineProps<{
  row: T;
  column: keyof T;
  value: string | number;
  type?: InputType;
  className?: string;
}>();

const emit = defineEmits<{
  commit: [string | number];
}>();

const { isEditing, startEdit, cancelEdit, startLoading, isLoading } = useEditableCell<T>();
const editing = computed(() => isEditing(props.row, props.column));
const loading = computed(() => isLoading(props.row, props.column));
const localValue = ref(props.value);
const errorState = ref(false);

const format = (value: typeof props.value) => formatByType(props.type, value);
const validate = (value: typeof props.value) => validateByType(props.type, value);

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

  const formattedValue = format(localValue.value);

  startLoading(props.row, props.column);
  emit('commit', formattedValue);

  localValue.value = formattedValue;
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
    :type="props.type ?? InputType.TEXT"
    @blur="handleCancel"
    @keydown="handleKeydown"
    v-focus
  />
  <AtomTableCell
    v-else
    :value="value ? value.toString() : ''"
    @click="startEdit(row, column)"
    :class="props.className"
  />
  <div v-if="loading" class="loadingState" />
</template>

<style scoped lang="scss">
input {
  &[type='number'] {
    -webkit-appearance: textfield;
    -moz-appearance: textfield;
    appearance: textfield;
  }
  display: flex;
  width: 100%;
  padding: 0.15rem 0.3rem;
  border: 1px solid var(--secondary-10);
  border-radius: 0.4rem;
  font-size: 0.9rem;
  letter-spacing: 3%;
  background: var(--secondary-10);
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
