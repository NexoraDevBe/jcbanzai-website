<script setup lang="ts">
interface Props {
  height?: number
  className?: string
}

withDefaults(defineProps<Props>(), {
  height: 24
})
</script>

<template>
  <svg :width="height*3" :height="height" viewBox="0 0 74 24" :class="className" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 10.5C1.17157 10.5 0.5 11.1716 0.5 12C0.5 12.8284 1.17157 13.5 2 13.5V12V10.5ZM73.0607 13.0607C73.6464 12.4749 73.6464 11.5251 73.0607 10.9393L63.5147 1.3934C62.9289 0.807612 61.9792 0.807612 61.3934 1.3934C60.8076 1.97918 60.8076 2.92893 61.3934 3.51472L69.8787 12L61.3934 20.4853C60.8076 21.0711 60.8076 22.0208 61.3934 22.6066C61.9792 23.1924 62.9289 23.1924 63.5147 22.6066L73.0607 13.0607ZM2 12V13.5H72V12V10.5H2V12Z"/>
  </svg>
</template>