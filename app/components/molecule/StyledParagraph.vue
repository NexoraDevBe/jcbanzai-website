<script setup lang="ts">
interface Props {
  right?: boolean
  maxWidth?: string
}

withDefaults(defineProps<Props>(), {
  right: false
})
</script>

<template>
<div class="styled-paragraph" :class="right ? 'right' : 'left'" :style="{maxWidth: maxWidth}">
  <div v-if="$slots.styleElement" class="style-element">
    <slot name="styleElement"/>
  </div>
  <h3 v-if="$slots.title">
    <slot name="title"/>
  </h3>
  <p v-if="$slots.content">
    <slot name="content"/>
  </p>
</div>
</template>

<style scoped lang="scss">
.styled-paragraph {
  position: relative;

  h3 {
    font-size: 2rem;
  }

  h3, p {
    margin: 0;
  }

  &.left, &.right {
    .style-element {
      position: absolute;
      top: 50%;
      z-index: -1;
    }
  }

  &.left {
    .style-element {
      left: 0;
      transform: translateX(-50%) translateY(-50%);
    }
  }

  &.right {
    .style-element {
      right: 0;
      transform: translateX(50%) translateY(-50%);
    }

    h3, p {
      text-align: right;
    }
  }
}
</style>