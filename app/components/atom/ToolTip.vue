<script setup lang="ts">
const hovering = ref(false)


const handleEnter = () => {
  if (!hovering.value) {
    hovering.value = true
  }
}

const handleLeave = () => {
  if (hovering.value) {
    hovering.value = false
  }
}


</script>

<template>
  <div class="tooltip-container">
    <div v-show="hovering" class="tooltip">
      <p>

      </p>
    </div>
    <div @mouseover="handleEnter" @mouseleave="handleLeave" aria-label="meer info icoon" class="tooltip-icon">
      <span>
        i
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tooltip-container {
  position: relative;
  display: inline-block;

  .tooltip {
    position: absolute;
    pointer-events: none;
  }

  .tooltip-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid var(--secondary-70);

    span {
      font-size: 16px;
      color: var(--secondary-70);
    }
  }
}
</style>