<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Sponsor {
  path: string
  link: string
  name?: string
}

interface Props {
  sponsors: Sponsor[]
}

const props = defineProps<Props>()

const sponsorsContainer = ref<HTMLElement>()
const sponsorsTrack = ref<HTMLElement>()
const carouselDuration = ref<string>('')
const isOverflowing = ref(false)

const checkOverflow = () => {
  if (sponsorsContainer.value && sponsorsTrack.value) {
    const containerWidth = sponsorsContainer.value.offsetWidth
    const trackWidth = sponsorsTrack.value.scrollWidth
    carouselDuration.value = trackWidth / 100 + 's'
    isOverflowing.value = trackWidth > containerWidth
  }
}

const waitForImagesToLoad = async () => {
  if (!sponsorsTrack.value) return

  const images = sponsorsTrack.value.querySelectorAll('img')
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
      ref="sponsorsContainer"
      class="sponsors"
      :class="{ 'carousel-enabled': isOverflowing }"
  >
    <div
        ref="sponsorsTrack"
        class="sponsors-track"
    >
      <MoleculeSponsorItem
          v-for="(sponsor, idx) in sponsors"
          :key="idx"
          :sponsor="sponsor"
      />
    </div>
    <div
        aria-hidden="true"
        v-show="isOverflowing"
        class="sponsors-track"
    >
      <MoleculeSponsorItem
          v-for="(sponsor, idx) in sponsors"
          :key="`duplicate-${idx}`"
          :sponsor="sponsor"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@keyframes scrolling {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

.sponsors {
  display: flex;
  overflow: hidden;
  position: relative;
  justify-content: center;

  .sponsors-track {
    display: flex;
    gap: 2rem;
    padding-right: 2rem;
  }

  &.carousel-enabled {
    justify-content: flex-start;

    .sponsors-track {
      will-change: transform;
      animation: scrolling v-bind('carouselDuration') linear infinite;
    }
  }
}
</style>