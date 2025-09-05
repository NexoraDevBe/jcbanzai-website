<script setup lang="ts">
interface Props {
  vertical: boolean
  size: number
  outline: boolean
}

defineProps<Props>()
</script>

<template>
  <span :class="[vertical ? 'vertical' : 'horizontal', 'size--' + size, outline ? 'outline' : 'fill']">
    <slot></slot>
  </span>
</template>

<style scoped lang="scss">
span {
  font: bold 1rem Arial;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}

.outline {
  color: transparent;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: var(--accent);
}

.fill {
  color: var(--secondary);
  opacity: .5;
}

.vertical {
  writing-mode: vertical-rl;
  text-orientation: upright;
}

.horizontal {
  writing-mode: lr;
}

.size--1 {
  font-size: 1.25rem;
}

.size--2 {
  font-size: 2rem;
}

.size--3 {
  font-size: 3rem;
}

.size--4 {
  font-size: 7rem;

  &.outline {
    -webkit-text-stroke-width: 2px;
  }
}

.size--5 {
  font-size: 15rem;

  &.outline {
    -webkit-text-stroke-width: 5px;
  }
}
</style>