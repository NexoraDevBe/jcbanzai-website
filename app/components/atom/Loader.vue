<script setup lang="ts">

</script>

<template>
  <svg width="130" height="30" viewBox="0 0 230 50" fill="var(--accent)" xmlns="http://www.w3.org/2000/svg">
    <circle cx="25"  cy="25" r="25" />
    <circle cx="70"  cy="25" r="25" />
    <circle cx="115" cy="25" r="25" />
    <circle cx="160" cy="25" r="25" />
    <circle cx="205" cy="25" r="25" />
  </svg>
</template>

<style scoped lang="scss">
circle {
  transform-box: fill-box;
  transform-origin: center;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 13.3%    { transform: scale(0.2); }
  20%          { transform: scale(0.28); }
  26.7%        { transform: scale(0.4); }
  33.3%        { transform: scale(0.8); }
  40%          { transform: scale(0.92); }
  46.7%        { transform: scale(0.96); }
  53.3%, 60%   { transform: scale(1); }
  66.7%        { transform: scale(0.96); }
  73.3%        { transform: scale(0.92); }
  80%          { transform: scale(0.8); }
  86.7%        { transform: scale(0.4); }
  93.3%        { transform: scale(0.28); }
  100%         { transform: scale(0.2); }
}

circle:nth-child(1) { animation-delay: 0s; }
circle:nth-child(2) { animation-delay: 0.1s; }
circle:nth-child(3) { animation-delay: 0.2s; }
circle:nth-child(4) { animation-delay: 0.3s; }
circle:nth-child(5) { animation-delay: 0.4s; }
</style>