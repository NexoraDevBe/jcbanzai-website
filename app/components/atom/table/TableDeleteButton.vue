<script lang="ts" setup generic="T extends { id: string | number; actions: unknown }">
const props = defineProps<{
  row: T;
  column: keyof T;
}>();

const emit = defineEmits<{
  delete: [void];
}>();

const open = ref<boolean>(false);
const confirmRef = ref<HTMLElement | null>(null);
const { startEdit, isEditing, cancelEdit } = useEditableCell<T>();

const handleDelete = () => {
  emit('delete');
  open.value = false;
};

onClickOutside(confirmRef, () => {
  if (isEditing(props.row, props.column)) handleCancel();
});

const handleCancel = () => {
  cancelEdit();
  open.value = false;
};

const handleOpen = () => {
  open.value = true;
  startEdit(props.row, props.column);
};
</script>
<template>
  <div class="delete-container">
    <button class="action danger" @click="handleOpen">
      <IconTrash :size="16" :stroke-width="2" color="danger" />
    </button>
    <div class="confirm-container" v-if="open" ref="confirmRef">
      <p>Bent u zeker?</p>
      <button class="action success" @click="handleDelete">
        <IconCheck :size="16" :stroke-width="2" color="success" />
      </button>
      <button class="action danger" @click="handleCancel">
        <IconDeleteCross :size="16" :stroke-width="2" color="danger" />
      </button>
    </div>
  </div>
</template>
<style scoped lang="scss">
.delete-container {
  position: relative;
  width: fit-content;

  .confirm-container {
    position: absolute;
    top: 0;
    right: 0;
    width: max-content;
    background: var(--primary);
    display: flex;
    gap: 0.3rem;
    align-items: center;
    justify-content: center;
    padding: 0.3rem;
    padding-left: 0.7rem;
    border-radius: 0.5rem;
    border: 1px solid var(--secondary-20);

    p {
      margin: 0;
      margin-right: 0.3rem;
    }
  }
}
</style>
