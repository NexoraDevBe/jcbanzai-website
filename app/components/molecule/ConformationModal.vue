<script setup lang="ts">
defineProps<{
  title: string;
  message: string;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <div class="modal-overlay" @click.self="emit('cancel')">
    <div class="modal">
      <h2>{{ title }}</h2>
      <p>{{ message }}</p>

      <div class="actions">
        <button type="button" class="cancel-btn" @click="emit('cancel')">
          Annuleren
        </button>
        <button type="button" class="confirm-btn" @click="emit('confirm')">
          Verdergaan
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  justify-content: center;
  align-items: center;

  background: rgb(0 0 0 / 50%);
  backdrop-filter: blur(4px);
}

.modal {
  width: min(90vw, 500px);
  padding: 2rem;

  background: var(--gray-150);
  border-radius: 1rem;

  h2 {
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 2rem;
    line-height: 1.5;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 999px;
    cursor: pointer;
    font-weight: 600;
  }

  .cancel-btn {
    background: var(--gray-200);
    color: var(--gray-950);
  }

  .confirm-btn {
    background: var(--accent);
    color: var(--light);
  }
}
</style>
