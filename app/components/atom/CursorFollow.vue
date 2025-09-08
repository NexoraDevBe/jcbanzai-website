<script setup lang="ts">
const cursor = ref<HTMLElement>()

document.body.onpointermove = event => {
  const { clientX, clientY } = event;
  if (!cursor.value) return;
  cursor.value.animate({
    left: `${clientX}px`,
    top: `${clientY}px`

  }, {duration: 1000, fill: "forwards"})
}
</script>

<template>
  <div ref="cursor" id="cursor"></div>
</template>

<style scoped lang="scss">
#cursor {
  display: none;
}

@media screen and (width >= 64rem) {
  #cursor {
    display: block;
    background-color: transparent;
    height: 1.25rem;
    border-radius: 50%;
    aspect-ratio: 1;
    transform: translate(-50%, -50%);
    position: fixed;
    backdrop-filter: invert(1);
    pointer-events: none;
  }
}
</style>