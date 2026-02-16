<script setup lang="ts">
interface Props {
  onClick?: () => void
  className?: string
}

const props = defineProps<Props>()

const handleClick = () => {
  if (!props.onClick) return
  props.onClick()
}
</script>

<template>
<button :class="className" @click="handleClick">
  <slot>
  </slot>
  <IconArrowExtd aria-label="arrow pointing right" :class-name="className === 'outline' ? 'fill-secondary' : 'fill-light'" :height="24"/>
</button>
</template>

<style scoped lang="scss">
button {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  width: fit-content;
  height: fit-content;
  padding: 0.5rem 1rem;
  border-radius: 5rem;
  background-color: var(--accent);
  color: var(--light);
  font-size: 1.5rem;
  font-weight: 500;
  font-family: 'Rokkitt', Arial, serif;
  text-transform: uppercase;
  cursor: pointer;
  border: 2px solid var(--accent);

  &.outline {
    background-color: transparent;
    color: var(--secondary);
  }

  &:hover {
    background-color: var(--accent-50);
  }
}
</style>