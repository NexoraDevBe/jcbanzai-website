<script setup lang="ts" generic="T extends { id: string | number }">
export type Option = { label: string; value: string };
export type Options = Option[];

const props = defineProps<{
  row: T;
  column: keyof T;
  value: string | number;
  options: Options;
}>();
const emit = defineEmits<{ commit: [string | number] }>();

const { isEditing, startEdit, cancelEdit, startLoading, isLoading } = useEditableCell<T>();
const editing = computed(() => isEditing(props.row, props.column));
const loading = computed(() => isLoading(props.row, props.column));
const localValue = ref(props.value);
const localLabel = computed(
  () => props.options.find((o) => o.value === localValue.value)?.label ?? String(localValue.value),
);

const rootRef = ref<HTMLElement | null>(null);
const listRef = ref<HTMLElement | null>(null);
const dropUp = ref(false);

function updatePosition() {
  const trigger = rootRef.value;
  const list = listRef.value;
  if (!trigger || !list) return;

  const rect = trigger.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const listHeight = list.offsetHeight;

  dropUp.value = spaceBelow < listHeight && spaceAbove > spaceBelow;
}

watch(editing, async (isEditingNow) => {
  if (!isEditingNow) return;
  await nextTick();
  updatePosition();
});

useEventListener(window, 'scroll', updatePosition, { passive: true, capture: true });
useEventListener(window, 'resize', updatePosition);

onClickOutside(listRef, () => {
  if (isEditing(props.row, props.column)) handleCancel();
});
onKeyStroke('Escape', () => {
  if (isEditing(props.row, props.column)) handleCancel();
});
watch(localValue, () => {
  if (isEditing(props.row, props.column)) handleCommit();
});

const handleCancel = () => cancelEdit();
const handleCommit = () => {
  startLoading(props.row, props.column);
  emit('commit', localValue.value);
  cancelEdit();
};
</script>

<template>
  <div ref="rootRef">
    <AtomTableCell
      :value="localLabel"
      @click="startEdit(row, column)"
      :class="editing ? 'fake-input' : ''"
    />
    <ul v-if="editing" ref="listRef" class="dmsans-500" :class="dropUp ? 'above' : 'below'">
      <li v-for="option in props.options" :key="option.value">
        <label :for="option.value.toString()">
          <input
            :id="option.value.toString()"
            type="radio"
            :value="option.value"
            :name="column.toString()"
            :checked="option.value === localValue"
            v-model="localValue"
          />
          {{ option.label }}
        </label>
      </li>
    </ul>
    <div v-if="loading" class="loadingState" />
  </div>
</template>

<style scoped lang="scss">
label {
  input {
    display: none;
  }
}

ul {
  list-style: none;
  position: absolute;
  left: 0;
  z-index: 4;
  margin: 0;
  padding: 0.25rem;
  border-radius: 0.5rem;
  background: var(--primary);
  border: 1px solid var(--secondary-20);
  display: grid;
  grid-template-columns: 100%;
  gap: 0.25rem;
  width: 100%;
  max-height: 30vh;
  overflow-y: auto;

  &.below {
    top: 100%;
    bottom: auto;
  }
  &.above {
    bottom: 100%;
    top: auto;
  }

  li {
    width: 100%;
    display: flex;

    label {
      width: 100%;
      flex-grow: 1;
      padding: 0.2rem;
      font-size: 0.9rem;
      border-radius: 0.3rem;

      &:hover {
        background: var(--accent-20);
      }

      &:has(input:checked),
      &.selected {
        background: var(--accent-40);
      }
    }
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
