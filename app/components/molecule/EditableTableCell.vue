<script setup lang="ts">
interface Props {
  value: any
  type: 'text' | 'checkbox' | 'date' | 'select' | 'array-text' | 'array-select' | 'readonly'
  disabled?: boolean
  className?: string
  options?: Array<{ value: string | number; label: string }>
  changed?: boolean
  arrayIndex?: number
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
    emit('update', {value: (target as HTMLInputElement).checked, index: props.arrayIndex})
  } else {
    emit('update', {value: target.value, index: props.arrayIndex})
  }
}

const handleAddItem = () => {
  arrayShow.value = true;
  emit('addArrayItem')
}

const handleRemoveItem = (index: number) => {
  if (index === 1 && props.value.length === 2) {
    arrayShow.value = false;
  }
  emit('removeArrayItem', index)
}

const arrayShow = ref<boolean>(false)
</script>

<template>
  <div class="table-cell" :class="[className, {'changed': changed}] ">
    <!-- Readonly (zoals ID) -->
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
      <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <!-- Arrays -->
    <div v-else-if="type.includes('array')" class="array-container">
      <div
          v-for="(item, index) in value"
          v-show="arrayShow || index === 0"
          :key="index"
          class="array-item"
      >

        <!-- Array Text -->
        <input
            v-if="type === 'array-text'"
            v-show="arrayShow || index === 0"
            type="text"
            :value="item"
            :disabled
            @input="emit('update', {value: ($event.target as HTMLInputElement).value, index: index})"
        />

        <!-- Array Select -->
        <select
            v-else-if="type === 'array-select'"
            :value="item"
            :disabled
            @change="emit('update', {value: ($event.target as HTMLInputElement).value, index: index})"
        >
          <option
              v-for="option in options"
              :key="option.value"
              :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>

        <button
            v-if="index === 0"
            type="button"
            class="btn btn-show"
            :class="[value.length > 1 ? 'btn-show' : 'btn-add', {'hidden': disabled && value.length === 1}]"
            @click="(value.length > 1 ? arrayShow = !arrayShow : handleAddItem())"
            :title="value.length > 1 ? 'Toon/Verberg items' : 'Voeg item toe'"
        >
          <IconChevron v-if="value.length > 1" :class="{'flip': arrayShow}" :size="16" :stroke-width="3" :color="'gray-800'"/>
          <IconAddCross v-else :size="20" :stroke-width="2.5" :color="'success'"/>
        </button>
        <button
            v-if="arrayShow && index !== 0"
            type="button"
            class="btn btn-remove"
            :disabled
            :class="{'hidden': disabled}"
            @click="handleRemoveItem(index)"
            title="Verwijder item"
        >
          <IconDeleteCross :size="20" :stroke-width="2.5" :color="'danger'"/>
        </button>
      </div>
      <button
          v-show="!disabled && arrayShow"
          type="button"
          class="btn-add"
          :disabled
          @click="handleAddItem"
          title="Voeg item toe"
      >
        <IconAddCross :size="20" :stroke-width="2.5" :color="'success'"/>
      </button>
    </div>

    <!-- Text input (default) -->
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
.table-cell {
  display: table-cell;
  vertical-align: middle;
  border: 1px solid var(--secondary-10);

  &.dnone {
    display: none;
  }

  input[type="text"],
  input[type="date"],
  select {
    min-width: 10rem;
    width: 100%;
    margin: 0;
    padding: 0.8rem 0.5rem;
    border: none;
    border-radius: 0;
    background: none;
    font-size: 1.1rem;
  }

  &:has(select),
  select {
    background-color: var(--gray-100);
  }

  input[type="checkbox"] {
    text-align: center;
    margin-left: 0.5rem;
  }

  &:has(input:focus), &:has(select:focus) {
    border-color: var(--accent);
  }

  &.changed {
    border-color: var(--warning);
  }

  &.id {
    width: 3rem;
    text-align: center;
    position: sticky;
    left: 0;
    background-color: var(--gray-100);
  }

  &.straat {
    min-width: 20rem;
  }

  &.emails {
    min-width: 30rem;
  }

  &.translation,
  &.video {
    min-width: 30rem;
    width: 30rem;
  }

  &.name, &.opmerkingen {
    min-width: 20rem;
    width: 25rem;
  }

  &.belt,
  &.category {
    width: 5rem;
  }

  p {
    margin: 0;
    padding: 0.3rem 0.5rem;
  }

  &:has(.array-container) {
    vertical-align: top;
  }

  .array-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    width: 100%;

    .array-item {
      display: flex;
      gap: 0.5rem;
      align-items: center;

      input[type="text"], select {
        flex: 1;
        border-radius: .4rem;
        padding: 0.3rem 0.5rem;
      }

      select {
        background-color: var(--gray-150);
      }

      input[type="text"] {
        background-color: var(--secondary-10);
      }

      .btn{
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.8rem;
        height: 1.8rem;
        padding: 0;
        background-color: transparent;
        border-radius: .4rem;
        cursor: pointer;
        transition: all 0.2s;

        &.hidden {
          visibility: hidden;
        }

        &:active {
          transform: scale(0.95);
        }

        &-remove {
          border: 2px solid var(--danger);
          color: var(--danger);

          &:hover {
            background-color: var(--danger-50);
          }
        }

        &-show {
          border: 2px solid var(--gray-800);
          color: var(--gray-800);

          .flip {
            scale: 1 -1;
          }

          &:hover {
            background-color: var(--secondary-30);
          }
        }

        &-add {
          width: 1.8rem;
          margin: 0;
          border: 2px solid var(--success);
          color: var(--success);

          .flip {
            rotate: 180deg;
          }

          &:hover {
            background-color: var(--success-50);
          }
        }
      }
    }

    .btn-add {
      display: flex;
      align-items: center;
      justify-content: center;
      width: calc(100% - 2.3rem);
      min-width:1.8rem;
      height: 1.8rem;
      padding: 0;
      border: 2px dashed var(--success);
      background-color: transparent;
      color: var(--success);
      border-radius: .4rem;
      cursor: pointer;
      transition: all 0.2s;
      margin-right: 2rem;

      &:hover {
        background-color: var(--success-50);
      }

      &:active {
        transform: scale(0.98);
      }
    }
  }
}
</style>