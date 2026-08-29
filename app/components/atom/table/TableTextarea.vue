<script setup lang="ts" generic="T extends { id: string | number }">
import { vFocus } from '~/directives/vFocus';

const props = defineProps<{
  row: T;
  column: keyof T;
  value: string | number;
  className?: string;
}>();

const emit = defineEmits<{
  commit: [string | number];
}>();

const { isEditing, startEdit, cancelEdit, startLoading, isLoading } = useEditableCell<T>();
const editing = computed(() => isEditing(props.row, props.column));
const loading = computed(() => isLoading(props.row, props.column));
const localValue = ref(props.value);

const rootRef = ref<HTMLElement | null>(null);
const textRef = ref<HTMLElement | null>(null);
const dropUp = ref(false);

function updatePosition() {
  const trigger = rootRef.value;
  const list = textRef.value;
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

onClickOutside(textRef, () => {
  if (isEditing(props.row, props.column)) handleCancel();
});
onKeyStroke('Escape', () => {
  if (isEditing(props.row, props.column)) handleCancel();
});

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') handleCancel();
};

const handleCancel = () => {
  localValue.value = props.value;
  cancelEdit();
};

const handleCommit = () => {
  startLoading(props.row, props.column);
  emit('commit', localValue.value);
  cancelEdit();
};
</script>

<template>
  <div ref="rootRef">
    <div
      v-if="editing"
      ref="textRef"
      class="textarea-container"
      :class="dropUp ? 'above' : 'below'"
    >
      <button class="close" @click="handleCancel">
        <IconClose :size="10" :stroke-width="3" />
      </button>
      <textarea class="dmsans-500" v-model="localValue" @keydown="handleKeydown" v-focus />
      <button class="save" @click="handleCommit">Opslaan</button>
    </div>
    <AtomTableCell
      :value="
        localValue
          ? localValue.toString().substring(0, 50) +
            (localValue.toString().length > 50 ? '...' : '')
          : ''
      "
      @click="startEdit(row, column)"
    />
    <div v-if="loading" class="loadingState" />
  </div>
</template>

<style scoped lang="scss">
.textarea-container {
  position: absolute;
  left: 0;
  z-index: 4;
  margin: 0;
  padding: 0.25rem;
  border-radius: 0.5rem;
  background: var(--primary);
  border: 1px solid var(--secondary-20);
  display: flex;
  width: max(25rem, 100%);
  height: 25vh;
  overflow-y: auto;

  &.below {
    top: 0;
    bottom: auto;
  }
  &.above {
    bottom: 0;
    top: auto;
  }

  textarea {
    resize: none;
    border: none;
    background: var(--secondary-10);
    border-radius: 0.3rem;
    font-size: 0.9rem;
    flex-grow: 1;
  }

  .close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.2rem;
  }

  .save {
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    font-size: 0.8rem;
    text-transform: capitalize;
    background: var(--accent);
    color: var(--light);
    border: none;
    cursor: pointer;
    padding: 0.2rem 0.4rem;
    // border-radius: 0.3rem;
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
