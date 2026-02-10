<script setup lang="ts">
interface Props {
  items: any[]
  speed?: number // pixels per second
  interactive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  speed: 100,
  interactive: false,
})

const carouselContainer = ref<HTMLElement>()
const carouselTrack = ref<HTMLElement>()
const carouselDuration = ref<string>('')
const isOverflowing = ref(false)

const isDragging = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)
const currentTranslateX = ref(0)
const targetTranslateX = ref(0)
const maxTranslateX = ref(0)
const velocity = ref(0)
const lastX = ref(0)
const lastTime = ref(0)

const checkOverflow = () => {
  if (carouselContainer.value && carouselTrack.value) {
    const containerWidth = carouselContainer.value.offsetWidth
    const trackWidth = carouselTrack.value.scrollWidth
    carouselDuration.value = trackWidth / props.speed + 's'
    isOverflowing.value = trackWidth > containerWidth

    if (props.interactive && isOverflowing.value) {
      maxTranslateX.value = trackWidth - containerWidth
    }
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

// Interactive drag handlers
const handleMouseDown = (e: MouseEvent) => {
  if (!props.interactive || !isOverflowing.value) return

  isDragging.value = true
  startX.value = e.pageX - (carouselContainer.value?.offsetLeft || 0)
  scrollLeft.value = targetTranslateX.value
  velocity.value = 0
  lastTime.value = 0

  e.preventDefault()
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !props.interactive) return

  e.preventDefault()
  const x = e.pageX - (carouselContainer.value?.offsetLeft || 0)
  const currentTime = Date.now()

  // Calculate velocity
  if (lastTime.value > 0) {
    const deltaX = x - lastX.value
    const deltaTime = currentTime - lastTime.value
    velocity.value = deltaX / (deltaTime || 1)
  }

  lastX.value = x
  lastTime.value = currentTime

  const walk = (x - startX.value)
  const newTranslateX = scrollLeft.value + walk

  targetTranslateX.value = Math.max(
      -maxTranslateX.value,
      Math.min(0, newTranslateX)
  )
}

const handleMouseUp = () => {
  if (isDragging.value) {
    // Apply momentum based on velocity
    targetTranslateX.value = currentTranslateX.value + (velocity.value * 300)
    targetTranslateX.value = Math.max(
        -maxTranslateX.value,
        Math.min(0, targetTranslateX.value)
    )
  }
  isDragging.value = false
  velocity.value = 0
  lastTime.value = 0
}

const handleMouseLeave = () => {
  if (isDragging.value) {
    targetTranslateX.value = currentTranslateX.value + (velocity.value * 300)
    targetTranslateX.value = Math.max(
        -maxTranslateX.value,
        Math.min(0, targetTranslateX.value)
    )
  }
  isDragging.value = false
  velocity.value = 0
  lastTime.value = 0
}

// Touch handlers for mobile support
const handleTouchStart = (e: TouchEvent) => {
  if (!props.interactive || !isOverflowing.value || !e.touches[0]) return

  isDragging.value = true
  startX.value = e.touches[0].pageX - (carouselContainer.value?.offsetLeft || 0)
  scrollLeft.value = targetTranslateX.value
  velocity.value = 0
  lastTime.value = 0
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value || !props.interactive || !e.touches[0]) return

  const x = e.touches[0].pageX - (carouselContainer.value?.offsetLeft || 0)
  const currentTime = Date.now()

  // Calculate velocity
  if (lastTime.value > 0) {
    const deltaX = x - lastX.value
    const deltaTime = currentTime - lastTime.value
    velocity.value = deltaX / (deltaTime || 1)
  }

  lastX.value = x
  lastTime.value = currentTime

  const walk = (x - startX.value)
  const newTranslateX = scrollLeft.value + walk

  targetTranslateX.value = Math.max(
      -maxTranslateX.value,
      Math.min(0, newTranslateX)
  )
}

const handleTouchEnd = () => {
  if (isDragging.value) {
    targetTranslateX.value = currentTranslateX.value + (velocity.value * 300)
    targetTranslateX.value = Math.max(
        -maxTranslateX.value,
        Math.min(0, targetTranslateX.value)
    )
  }
  isDragging.value = false
  velocity.value = 0
  lastTime.value = 0
}

// Smoothing loop (runs always, smoothing during drag and momentum after release)
const smoothFactor = 0.12
let rafId: number

const animate = () => {
  if (isDragging.value) {
    currentTranslateX.value += (targetTranslateX.value - currentTranslateX.value) * smoothFactor
  } else {
    // Smooth deceleration after release
    currentTranslateX.value += (targetTranslateX.value - currentTranslateX.value) * 0.08
  }
  rafId = requestAnimationFrame(animate)
}

onMounted(async () => {
  await waitForImagesToLoad()
  checkOverflow()
  window.addEventListener('resize', checkOverflow)

  if (props.interactive) {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  rafId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkOverflow)
  if (props.interactive) {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  cancelAnimationFrame(rafId)
})

const trackTransform = computed(() => {
  if (props.interactive && isOverflowing.value) {
    return `translateX(${Math.round(currentTranslateX.value)}px)`
  }
  return ''
})
</script>

<template>
  <div
      ref="carouselContainer"
      class="carousel"
      :class="{
        'carousel-enabled': isOverflowing && !interactive,
        'carousel-interactive': interactive && isOverflowing,
        'carousel-dragging': isDragging
      }"
      @mousedown="handleMouseDown"
      @mouseleave="handleMouseLeave"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
  >
    <div
        ref="carouselTrack"
        class="carousel-track"
        :style="{ transform: trackTransform }"
    >
      <slot
          v-for="(item, idx) in items"
          :key="idx"
          :item="item"
          :index="idx"
      />
    </div>
    <!-- Duplicate track for auto-scroll -->
    <div
        aria-hidden="true"
        v-show="isOverflowing && !interactive"
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
    gap: 2rem;
    padding: 1rem;
    flex-shrink: 0;
    z-index: 1;
    will-change: transform;
    transition: transform 0.3s ease;
  }

  &.carousel-enabled {
    justify-content: flex-start;

    .carousel-track {
      animation: scrolling v-bind('carouselDuration') linear infinite;
    }
  }

  &.carousel-interactive {
    justify-content: flex-start;
    cursor: grab;
    margin: 0 calc(var(--page-margin) * -1);
    padding-left: var(--page-margin);

    overflow-x: scroll;
    padding-right: calc(var(--page-margin));
    scrollbar-color: transparent transparent;

    &.carousel-dragging {
      cursor: grabbing;

      .carousel-track {
        transition: none;
      }
    }

    .carousel-track {
      filter: brightness(1);
      transition: filter 0.3s ease;
      transition-delay: 3s;
    }
  }
}

@media screen and (width >= 64rem) {
  .carousel {
    &.carousel-interactive {
      overflow-x: hidden;

      &:hover::before,
      &:not(:hover)::before {
        content: 'versleep';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 0.6rem 1rem;
        border-radius: 5rem;
        text-transform: uppercase;
        font-weight: 600;
        z-index: 2;
        transition: opacity 0.3s ease;
      }

      &:hover::before {
        background: var(--accent-80);
        opacity: 0;
      }

      &:not(:hover)::before {
        background: var(--accent);
        opacity: 0.9;
        transition-delay: 3s;
      }

      .carousel-track {
        filter: brightness(0.8);
      }

      &:hover .carousel-track {
        filter: brightness(1);
        transition-delay: 0s;
      }
    }
  }
}
</style>