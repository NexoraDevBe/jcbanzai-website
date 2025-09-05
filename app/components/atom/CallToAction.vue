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
  <IconArrowExtd :class-name="'fill-light'" :height="24"/>
</button>
</template>

<style scoped lang="scss">
button {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  width: fit-content;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5rem;
  background-color: var(--accent);
  color: var(--light);
  font-size: 1.5rem;
  font-weight: 500;
  font-family: 'Rokkitt', Arial, serif;
  text-transform: uppercase;
  cursor: pointer;
}
</style>