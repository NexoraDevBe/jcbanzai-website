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
</button>
</template>

<style scoped lang="scss">
button {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5rem;
  background-color: var(--accent);
  color: var(--light);
  font-size: 1.5rem;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
}
</style>