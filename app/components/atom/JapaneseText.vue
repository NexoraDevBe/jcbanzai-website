<script setup lang="ts">
const props = defineProps(
    [
        'vertical',
        'size',
        'outline'
    ]
)
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
  color: var(--primary);
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
  font-size: 1rem;
}

.size--2 {
  font-size: 2rem;
}

.size--3 {
  font-size: 3rem;
}

.size--4 {
  font-size: 5rem;
}

.size--5 {
  font-size: 10rem;
}
</style>