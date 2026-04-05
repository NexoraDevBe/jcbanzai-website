<script setup lang="ts">
interface Props {
  value: any
  type: 'text' | 'textarea' | 'checkbox' | 'date' | 'select' | 'array-text' | 'array-select' | 'array-select-horizontal' | 'readonly'
  disabled?: boolean
  className?: string
  options?: Array<{ value: string | number; label: string }>
  changed?: boolean
  arrayIndex?: number
  expandAll?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [value: any, arrayIndex?: number]
  addArrayItem: []
  removeArrayItem: [index: number]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLSelectElement
  if (props.type === 'checkbox') {
    emit('update', { value: (target as HTMLInputElement).checked, index: props.arrayIndex })
  } else {
    emit('update', { value: target.value, index: props.arrayIndex })
  }
}

const handleAddItem = () => {
  arrayShow.value = true
  emit('addArrayItem')
}

const handleRemoveItem = (index: number) => {
  if (index === 1 && props.value.length === 2) arrayShow.value = false
  emit('removeArrayItem', index)
}

const handleTextareaClose = () => { textareaShow.value = false }

const arrayShow = ref<boolean>(false)
const textareaShow = ref<boolean>(false)

watch(() => props.expandAll, (newVal) => {
  if (newVal !== undefined && (props.type === 'array-text' || props.type === 'array-select')) {
    if (props.value.length > 1) arrayShow.value = newVal
  }
})
</script>

<template>
  <div class="table-cell" :class="[className, { changed }]">

    <!-- Readonly -->
    <p v-if="type === 'readonly'">{{ value }}</p>

    <!-- Checkbox -->
    <input
        v-else-if="type === 'checkbox'"
        type="checkbox"
        :checked="value"
        :disabled="disabled"
        @change="handleInput"
    />

    <!-- Date -->
    <input
        v-else-if="type === 'date'"
        type="date"
        :value="value"
        :disabled="disabled"
        @input="handleInput"
    />

    <!-- Select -->
    <select
        v-else-if="type === 'select'"
        :value="value"
        :disabled="disabled"
        @change="handleInput"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <!-- Horizontal Array Select -->
    <div v-else-if="type === 'array-select-horizontal'" class="array-horizontal-container">
      <div class="array-horizontal-items">
        <div v-for="(item, index) in value" :key="index" class="array-horizontal-item">
          <select
              :value="item"
              :disabled="disabled"
              @change="emit('update', { value: ($event.target as HTMLSelectElement).value, index })"
          >
            <option v-for="option in options" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <button
              v-if="!disabled && value.length > 1"
              type="button"
              class="btn btn-remove"
              title="Verwijder item"
              @click="handleRemoveItem(index)"
          >
            <IconDeleteCross :size="12" :stroke-width="2.5" :color="'danger'" />
          </button>
        </div>

        <button
            v-if="!disabled"
            type="button"
            class="btn btn-add"
            title="Voeg item toe"
            @click="handleAddItem"
        >
          <IconAddCross :size="12" :stroke-width="2.5" :color="'success'" />
        </button>
      </div>
    </div>

    <!-- Arrays (Vertical) -->
    <div v-else-if="type.includes('array')" class="array-container">
      <div
          v-for="(item, index) in value"
          v-show="arrayShow || index === 0"
          :key="index"
          class="array-item"
      >
        <input
            v-if="type === 'array-text'"
            type="text"
            :value="item"
            :disabled="disabled"
            @input="emit('update', { value: ($event.target as HTMLInputElement).value, index })"
        />
        <select
            v-else-if="type === 'array-select'"
            :value="item"
            :disabled="disabled"
            @change="emit('update', { value: ($event.target as HTMLInputElement).value, index })"
        >
          <option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <!-- First item: toggle expand / add -->
        <button
            v-if="index === 0"
            type="button"
            class="btn"
            :class="[value.length > 1 ? 'btn-show' : 'btn-add', { hidden: disabled && value.length === 1 }]"
            :title="value.length > 1 ? 'Toon/Verberg items' : 'Voeg item toe'"
            @click="value.length > 1 ? (arrayShow = !arrayShow) : handleAddItem()"
        >
          <IconChevron v-if="value.length > 1" :class="{ flip: arrayShow }" :size="12" :stroke-width="2.5" :color="'gray-800'" />
          <IconAddCross v-else :size="16" :stroke-width="2" :color="'success'" />
        </button>

        <!-- Other items: remove -->
        <button
            v-if="arrayShow && index !== 0"
            type="button"
            class="btn btn-remove"
            :disabled="disabled"
            :class="{ hidden: disabled }"
            title="Verwijder item"
            @click="handleRemoveItem(index)"
        >
          <IconDeleteCross :size="16" :stroke-width="2" :color="'danger'" />
        </button>
      </div>

      <button
          v-show="!disabled && arrayShow"
          type="button"
          class="btn btn-add btn-add-full"
          @click="handleAddItem"
          title="Voeg item toe"
      >
        <IconAddCross :size="16" :stroke-width="2" :color="'success'" />
      </button>
    </div>

    <!-- Textarea -->
    <div
        v-else-if="type === 'textarea'"
        class="textarea-trigger"
        @click="() => { if (!disabled) textareaShow = true }"
    >
      <p>{{ value.length > 10 ? value.substring(0, 10) + '…' : value }}</p>

      <Teleport to="body">
        <div v-show="textareaShow" class="textarea-overlay" @click.self="handleTextareaClose">
          <div class="textarea-modal">
            <textarea :value="value" :disabled="disabled" @input="handleInput" />
            <button class="btn-close" @click="handleTextareaClose">Sluiten</button>
          </div>
        </div>
      </Teleport>
    </div>

    <!-- Text (default) -->
    <input
        v-else
        type="text"
        :value="value"
        :disabled="disabled"
        @input="handleInput"
    />
  </div>
</template>

<style scoped lang="scss">
/* ─── Shared btn tokens ───────────────────────────────────────────── */
%btn-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4rem;
  height: 1.4rem;
  padding: 0;
  background: transparent;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: background-color 0.15s, transform 0.1s;
  flex-shrink: 0;

  &:active { transform: scale(0.93); }
  &.hidden { visibility: hidden; }
}

%btn-remove {
  @extend %btn-base;
  border: 1px solid var(--danger);
  &:hover { background-color: var(--danger-50); }
}

%btn-show {
  @extend %btn-base;
  border: 1px solid var(--gray-800);
  .flip { scale: 1 -1; }
  &:hover { background-color: var(--secondary-30); }
}

%btn-add {
  @extend %btn-base;
  border: 1px dashed var(--success);
  &:hover { background-color: var(--success-50); }
}

/* ─── Cell shell ──────────────────────────────────────────────────── */
.table-cell {
  display: table-cell;
  vertical-align: middle;
  border: 1px solid var(--secondary-10);
  min-width: 10rem;
  font-size: 0.9rem;
  font-family: system-ui;

  /* size overrides */
  &.dnone    { display: none; }
  &.id       { min-width: 3rem; text-align: center; position: sticky; left: 0; background-color: var(--gray-100); }
  &.straat   { min-width: 20rem; }
  &.emails   { min-width: 30rem; }
  &.translation, &.video { min-width: 30rem; width: 30rem; }
  &.name, &.opmerkingen  { min-width: 20rem; width: 25rem; }
  &.belt, &.category     { width: 5rem; }
  &.beschikbaar:has(.array-horizontal-container),
  &.planning:has(.array-horizontal-container) {
    min-width: 45vw;
    width: 55vw;
    max-width: 65rem;
  }

  &:has(select), select { background-color: var(--gray-100); }
  &:has(input:focus), &:has(select:focus) { border-color: var(--accent); }
  &.changed { border-color: var(--warning); }
  &:has(.array-container) { vertical-align: top; }

  /* ── Shared input / select / date base ── */
  input[type="text"],
  input[type="date"],
  select {
    width: 100%;
    min-width: 10rem;
    margin: 0;
    padding: 0.35rem 0.4rem;
    border: none;
    border-radius: 0;
    background: none;
    font-size: 0.9rem;
    font-family: system-ui;
    line-height: 1.2;
  }

  input[type="checkbox"] {
    margin-left: 0.5rem;
    accent-color: var(--secondary);
    opacity: 0.3;
    border: 1px solid var(--secondary);
    &:checked { opacity: 1; }
  }

  p {
    margin: 0;
    padding: 0.2rem 0.3rem;
    font-size: 0.9rem;
    font-family: system-ui;
  }
}

/* ─── Horizontal array ────────────────────────────────────────────── */
.array-horizontal-container {
  padding: 0.25rem;
  width: 100%;

  .array-horizontal-items {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    align-items: center;
  }

  .array-horizontal-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    border-radius: 0.4rem;

    select {
      min-width: 6rem;
      width: auto;
      padding: 0.2rem 0.35rem;
      border-radius: 0.4rem;
      background-color: var(--gray-150);
      font-size: 0.8rem;
    }
  }

  .btn         { @extend %btn-base; }
  .btn-remove  { @extend %btn-remove; }
  .btn-add     { @extend %btn-add; }
}

/* ─── Vertical array ──────────────────────────────────────────────── */
.array-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.25rem;
  width: 100%;

  .array-item {
    display: flex;
    gap: 0.25rem;
    align-items: center;

    input[type="text"],
    select {
      flex: 1;
      border-radius: 0.4rem;
      padding: 0.2rem 0.35rem;
      font-size: 0.8rem;
    }
    select      { background-color: var(--gray-150); }
    input[type="text"] { background-color: var(--secondary-10); }
  }

  .btn        { @extend %btn-base; }
  .btn-remove { @extend %btn-remove; }
  .btn-show   { @extend %btn-show; }
  .btn-add    { @extend %btn-add; }

  .btn-add-full {
    width: 100%;
    border-style: dashed;
    height: 1.4rem;
  }
}

/* ─── Textarea ────────────────────────────────────────────────────── */
.textarea-trigger {
  cursor: pointer;
  padding: 0.2rem 0.3rem;
  p { margin: 0; }
}

.textarea-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.textarea-modal {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: min(70%, 60rem);
  min-width: 15rem;
  height: 40vh;
  padding: 1.5rem;
  background-color: var(--primary-40);
  border: 1px solid var(--secondary-40);
  border-radius: 1.8rem;

  textarea {
    flex: 1;
    width: 100%;
    background-color: var(--primary);
    border-radius: 0.5rem;
    padding: 0.5rem;
    resize: none;
  }

  .btn-close {
    align-self: flex-end;
    padding: 0.35rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--danger);
    background: transparent;
    color: var(--danger);
    cursor: pointer;
    &:hover { background-color: var(--danger-50); }
  }
}
</style>