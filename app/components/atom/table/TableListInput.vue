<script setup lang="ts" generic="T extends { id: string | number }">
import { vFocus } from '~/directives/vFocus';
import { InputType } from '~/utils/enums/inputs';
import { formatByType } from '~/utils/inputs/formatter';
import { validateByType } from '~/utils/inputs/validator';

const props = defineProps<{
  row: T;
  column: keyof T;
  value: string[];
  type?: InputType;
  className?: string;
}>();
const emit = defineEmits<{
  commit: [string[]];
}>();
const { isEditing, startEdit, cancelEdit, startLoading, isLoading } = useEditableCell<T>();
const editing = computed(() => isEditing(props.row, props.column));
const loading = computed(() => isLoading(props.row, props.column));

const localValue = ref<string[]>([...props.value]);
const draft = ref('');
const errorState = ref(false);

const rootRef = ref<HTMLElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);
const dropUp = ref(false);

function updatePosition() {
  const trigger = rootRef.value;
  const list = containerRef.value;
  if (!trigger || !list) return;
  const rect = trigger.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const listHeight = list.offsetHeight;
  dropUp.value = spaceBelow < listHeight && spaceAbove > spaceBelow;
}

watch(editing, async (isEditingNow) => {
  if (!isEditingNow) return;
  localValue.value = [...props.value];
  draft.value = '';
  errorState.value = false;
  await nextTick();
  updatePosition();
});

useEventListener(window, 'scroll', updatePosition, { passive: true, capture: true });
useEventListener(window, 'resize', updatePosition);

onClickOutside(containerRef, () => {
  if (isEditing(props.row, props.column)) handleCancel();
});
onKeyStroke('Escape', () => {
  if (isEditing(props.row, props.column)) handleCancel();
});

const format = (val: string) =>
  props.type ? (formatByType(props.type, val) as string) : val.trim();
const validate = (val: string) => (props.type ? validateByType(props.type, val) : val.length > 0);

const addItem = () => {
  if (!draft.value.trim()) return;
  const candidate = format(draft.value);
  if (!validate(candidate)) {
    errorState.value = true;
    return;
  }
  if (!localValue.value.includes(candidate)) {
    localValue.value.push(candidate);
  }
  draft.value = '';
  errorState.value = false;
};

const removeItem = (index: number) => {
  localValue.value.splice(index, 1);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault();
    addItem();
  }
  if (event.key === 'Escape') handleCancel();
  if (event.key === 'Backspace' && !draft.value && localValue.value.length) {
    removeItem(localValue.value.length - 1);
  }
};

const handleCancel = () => {
  localValue.value = [...props.value];
  draft.value = '';
  errorState.value = false;
  cancelEdit();
};

const handleCommit = () => {
  addItem();
  startLoading(props.row, props.column);
  emit('commit', localValue.value);
  cancelEdit();
};
</script>

<template>
  <div ref="rootRef">
    <div
      v-if="editing"
      ref="containerRef"
      class="tags-container"
      :class="dropUp ? 'above' : 'below'"
    >
      <button class="close" @click="handleCancel">
        <IconClose :size="10" :stroke-width="3" />
      </button>
      <ul class="chips">
        <li v-for="(item, index) in localValue" :key="item">
          <span>{{ item }}</span>
          <button class="remove" @click="removeItem(index)">
            <IconClose :size="8" :stroke-width="3" />
          </button>
        </li>
      </ul>
      <div class="add-container">
        <input
          class="dmsans-500"
          :class="{ error: errorState }"
          v-model="draft"
          type="text"
          placeholder="Toevoegen…"
          @keydown="handleKeydown"
          v-focus
        />
        <button class="save" @click="handleCommit">Opslaan</button>
      </div>
    </div>
    <AtomTableCell :value="value" @click="startEdit(row, column)" :class="props.className" />
    <div v-if="loading" class="loadingState" />
  </div>
</template>

<style scoped lang="scss">
.tags-container {
  position: absolute;
  left: 0;
  z-index: 4;
  margin: 0;
  padding: 0.25rem;
  padding-top: 1.5rem;
  border-radius: 0.5rem;
  background: var(--primary);
  border: 1px solid var(--secondary-20);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: max(20rem, 100%);

  &.below {
    top: 0;
    bottom: auto;
  }
  &.above {
    bottom: 0;
    top: auto;
  }

  .chips {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin: 0;
    padding: 0;
    max-height: 15vh;
    overflow-y: auto;

    li {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.15rem 0.3rem;
      border-radius: 0.3rem;
      background: var(--secondary-10);
      font-size: 0.85rem;

      .remove {
        display: flex;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        opacity: 0.6;
        &:hover {
          opacity: 1;
        }
      }
    }
  }

  .add-container {
    display: flex;
    align-items: center;
    border: 1px solid var(--secondary-20);
    border-radius: 0.4rem;
    background: var(--secondary-10);

    input {
      display: flex;
      width: 100%;
      padding: 0.15rem 0.3rem;
      border: none;
      font-size: 0.8rem;
      letter-spacing: 3%;
      background: transparent;
    }

    .save {
      font-size: 0.8rem;
      text-transform: capitalize;
      background: var(--accent);
      color: var(--light);
      border: none;
      border-radius: 0.4rem;
      border-bottom-left-radius: 0;
      border-top-left-radius: 0;
      cursor: pointer;
      padding: 0.2rem 0.4rem;
      width: fit-content;
      flex-shrink: 0;
    }
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
