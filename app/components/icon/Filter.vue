<script setup lang="ts">
interface Props {
  size?: number
  strokeWidth?: number
  color?: string
}

withDefaults(defineProps<Props>(), {
  size: 24,
  strokeWidth: 2,
  color: 'secondary'
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
        d="M4 3H20C20.2652 3 20.5196 3.10703 20.7071 3.29754C20.8946 3.48805 21 3.74644 21 4.01586V5.62701C20.9999 5.89642 20.8946 6.15476 20.707 6.34523L14.293 12.861C14.1055 13.0514 14.0001 13.3098 14 13.5792V19.9842C14 20.1386 13.9653 20.291 13.8987 20.4297C13.832 20.5685 13.735 20.69 13.6152 20.785C13.4954 20.88 13.3558 20.946 13.2071 20.978C13.0584 21.01 12.9044 21.0071 12.757 20.9696L10.757 20.4616C10.5408 20.4066 10.3488 20.2797 10.2117 20.1012C10.0745 19.9227 10 19.7027 10 19.4762V13.5792C9.99994 13.3098 9.89455 13.0514 9.707 12.861L3.293 6.34523C3.10545 6.15476 3.00006 5.89642 3 5.62701V4.01586C3 3.74644 3.10536 3.48805 3.29289 3.29754C3.48043 3.10703 3.73478 3 4 3Z"
        :stroke="`var(--${color})`"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
  </svg>
</template>