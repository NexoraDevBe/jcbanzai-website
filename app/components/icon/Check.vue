<script setup lang="ts">
interface Props {
  size?: number;
  strokeWidth?: number;
  color?: string;
}

withDefaults(defineProps<Props>(), {
  size: 24,
  strokeWidth: 1.5,
  color: 'secondary',
});
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    :stroke="`var(--${color})`"
    :stroke-width="strokeWidth"
    :width="size"
    :height="size"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
</template>
