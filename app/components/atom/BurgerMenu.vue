<script setup lang="ts">
interface Props {
  isOpen?: boolean
  hasInteracted?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  hasInteracted: false
})

const emit = defineEmits<{
  toggle: []
}>()

const handleToggle = () => {
  emit('toggle')
}
</script>

<template>
  <div
      class="burger-menu-container"
      :class="{
      opened: hasInteracted && isOpen,
      closed: hasInteracted && !isOpen
    }"
  >
    <button
        aria-label="navigatie menu knop"
        @click="handleToggle"
        class="burger-menu"
    >
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </button>
  </div>
</template>

<style scoped lang="scss">
$line-width: 2rem;
$line-height: 4px;
$line-radius: 1rem;
$btn-size: 3.5rem;
$anim-ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
$anim-speed: 0.6s;

@mixin line-base {
  position: absolute;
  top: 50%;
  left: 50%;
  width: $line-width;
  height: $line-height;
  border-radius: $line-radius;
  background-color: var(--gray-800);
  backdrop-filter: blur(5px);
  transform: translate(-50%, -50%);
  transform-origin: center;
}

@mixin animation($name) {
  animation: #{$name} $anim-speed $anim-ease forwards;
}

.burger-menu-container {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: $btn-size;
  height: $btn-size;
  border-radius: 50%;
  z-index: -1;
  pointer-events: all;

  .burger-menu {
    position: relative;
    background: transparent;
    height: 100%;
    width: 100%;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    padding: 0 0 0.25rem;

    span {
      @include line-base;

      &:first-child { top: 30%; }
      &:last-child { top: 70%; }
    }
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    width: $btn-size;
    height: $btn-size;
    border-radius: 50%;
    backdrop-filter: blur(5px);
    background-color: var(--primary-50);
    z-index: -1;
    transition: all 0.5s $anim-ease;
  }

  &.opened {
    &::after {
      background-color: var(--primary-90);
      animation: expandToFullscreen 0.5s $anim-ease forwards;
    }

    .burger-menu span {
      &:first-child { @include animation(burger-to-cross-first); }
      &:nth-child(2) { @include animation(burger-to-cross-middle); }
      &:last-child  { @include animation(burger-to-cross-last); }
    }
  }

  &.closed {
    &::after {
      background-color: var(--primary-50);
      animation: reduceFromFullscreen 0.5s $anim-ease forwards;
    }

    .burger-menu span {
      &:first-child { @include animation(cross-to-burger-first); }
      &:nth-child(2) { @include animation(cross-to-burger-middle); }
      &:last-child  { @include animation(cross-to-burger-last); }
    }
  }
}
</style>