<script setup lang="ts">
import { ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
  }>(),
  { placeholder: 'Zoeken...' },
);
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const local = ref(props.modelValue);

watch(
  () => props.modelValue,
  (value) => {
    if (value !== local.value) local.value = value;
  },
);

function search() {
  emit('update:modelValue', local.value);
}

function clear() {
  local.value = '';
  emit('update:modelValue', '');
}
</script>
<template>
  <div class="table-search">
    <input
      v-model="local"
      type="text"
      class="table-search-input"
      :placeholder="placeholder"
      @keyup.enter="search"
    />
    <button type="button" class="clear-btn" aria-label="Wissen" @click="clear">
      <IconClose v-if="local" :size="12" :stroke-width="2" color="secondary" />
    </button>
    <button class="save" type="button" @click="search">
      <IconSearch :size="15" :stroke-width="2" color="secondary" />
      Zoek
    </button>
  </div>
</template>

<style scoped lang="scss">
input {
  font-family: 'DM Sans';
}

.table-search {
  position: relative;
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--secondary-20);
  border-radius: 0.5rem;
  background: var(--primary);

  &:focus-within {
    border-color: var(--accent);
  }

  .icon {
    width: 1rem;
    height: 1rem;
    color: var(--gray-700);
  }

  .save {
    display: flex;
    gap: 0.5rem;
    font-size: 0.8rem;
    text-transform: capitalize;
    background: var(--accent);
    color: var(--light);
    border: 0.2rem solid var(--primary);

    cursor: pointer;
    padding: 0 0.3rem;
    flex-grow: 1;
    max-width: fit-content;

    height: 100%;
    border-radius: 0.5rem;
  }
}

.table-search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.3rem 0.5rem;
  font-size: 0.82rem;
  color: var(--secondary);

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: var(--gray-700);
  }
}

.clear-btn {
  border: none;
  background: transparent;
  color: var(--gray-700);
  cursor: pointer;
  padding: 0.2rem;
  width: 1.5rem;

  &:hover {
    color: var(--accent);
  }
}
</style>
