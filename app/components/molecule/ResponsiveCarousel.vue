<script setup lang="ts">
interface Props {
  items: any[]
  gap?: string
  padding?: string
  speed?: number // pixels per second
}

const props = withDefaults(defineProps<Props>(), {
  gap: '2rem',
  padding: '1rem',
  speed: 100
})

const carouselContainer = ref<HTMLElement>()
const carouselTrack = ref<HTMLElement>()
const carouselDuration = ref<string>('')
const isOverflowing = ref(false)

const checkOverflow = () => {
  if (carouselContainer.value && carouselTrack.value) {
    const containerWidth = carouselContainer.value.offsetWidth
    const trackWidth = carouselTrack.value.scrollWidth
    carouselDuration.value = trackWidth / props.speed + 's'
    isOverflowing.value = trackWidth > containerWidth
  }
}

const waitForImagesToLoad = async () => {
  if (!carouselTrack.value) return

  const images = carouselTrack.value.querySelectorAll('img')
  const imagePromises = Array.from(images).map((img) => {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve(true)
      } else {
        img.onload = () => resolve(true)
        img.onerror = () => resolve(true)
      }
    })
  })

  await Promise.all(imagePromises)
}

onMounted(async () => {
  await waitForImagesToLoad()
  checkOverflow()
  window.addEventListener('resize', checkOverflow)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkOverflow)
})
</script>

<template>
  <div
      ref="carouselContainer"
      class="carousel"
      :class="{ 'carousel-enabled': isOverflowing }"
  >
    <div
        ref="carouselTrack"
        class="carousel-track"
    >
      <slot
          v-for="(item, idx) in items"
          :key="idx"
          :item="item"
          :index="idx"
      />
    </div>
    <div
        aria-hidden="true"
        v-show="isOverflowing"
        class="carousel-track"
    >
      <slot
          v-for="(item, idx) in items"
          :key="`duplicate-${idx}`"
          :item="item"
          :index="idx"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.carousel {
  display: flex;
  overflow: hidden;
  position: relative;
  justify-content: center;

  .carousel-track {
    display: flex;
    gap: v-bind('gap');
    padding: v-bind('padding');
  }

  &.carousel-enabled {
    justify-content: flex-start;

    .carousel-track {
      will-change: transform;
      animation: scrolling v-bind('carouselDuration') linear infinite;
    }
  }
}
</style>