<script setup lang="ts">

</script>

<template>
  <div aria-hidden="true" class="scroll-indicator">
    <div class="scroll-dot"/>
  </div>
</template>

<style scoped lang="scss">
.scroll-indicator {
  position: absolute;
  bottom: 10vh;
  display: flex;
  justify-content: center;
  height: 80px;
  width: 16px;
  border-radius: 1rem;
  background: linear-gradient(var(--secondary-70), transparent);

  .scroll-dot {
    width: 12px;
    height: 12px;
    background-color: var(--accent);
    border-radius: 50%;
    animation: scrollIndicator 5s infinite ease-in-out;
  }
}
</style>