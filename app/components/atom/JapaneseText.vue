<script setup lang="ts">
interface Props {
  vertical: boolean
  size: number
  outline: boolean
}

defineProps<Props>()
</script>

<template>
  <span aria-hidden="true" :class="[vertical ? 'vertical' : 'horizontal', 'size--' + size, outline ? 'outline' : 'fill']">
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
  pointer-events: none;
}

.outline {
  color: transparent;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: var(--accent);
}

.fill {
  color: var(--secondary-10);
}

.vertical {
  writing-mode: vertical-lr;
  text-orientation: upright;
  height: max-content;
}

.horizontal {
  writing-mode: lr;
  width: max-content;
}

.size--1 {
  font-size: 1.25rem;
}

.size--2 {
  font-size: 2rem;
}

.size--3 {
  font-size: 3rem;

  &.outline {
    width: 5rem;
    min-width: 5rem;
    text-align: center;
    -webkit-text-stroke-color: var(--accent-40);

    @media(prefers-color-scheme: dark) {
      -webkit-text-stroke-color: var(--accent-70);
    }

    @supports (-moz-appearance: none) {
      width: fit-content;
      min-width: fit-content;
    }
  }
}

.size--4 {
  font-size: 3rem;

  &.outline {
    -webkit-text-stroke-width: 1px;
  }
}

@media screen and (width >= 40rem) {
  .size--2 {
    font-size: 3rem;
  }
}

@media screen and (width >= 48rem) {
  .size--4 {
    font-size: 7rem;

    &.outline {
      -webkit-text-stroke-width: 2px;
    }
  }
}

.size--5 {
  font-size: 15rem;

  &.outline {
    -webkit-text-stroke-width: 2px;
  }
}
</style>