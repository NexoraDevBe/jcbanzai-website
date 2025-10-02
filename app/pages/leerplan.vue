<script setup lang="ts">
import {supabase} from '~/utils/supabase'

interface Technique {
  name: string,
  belt: string,
  category: string,
  translation: string,
  video: string,
  id: number
}

const techniques = ref<Technique[]>([]);
const availableBelts = ref<string[]>(['yellow', 'orange', 'green', 'blue', 'brown', 'black']);
const availableCategories = ref<string[]>([]);
const selectedRecord = ref<Technique>()

const CACHE_NAME = 'techniques-cache'
const CACHE_KEY = 'techniques-data'
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

async function getTechniques() {
  if (import.meta.client) {
    try {
      const cache = await caches.open(CACHE_NAME)
      const cachedResponse = await cache.match(CACHE_KEY)

      if (cachedResponse) {
        const { data, timestamp } = await cachedResponse.json()
        const now = Date.now()

        if (now - timestamp < CACHE_DURATION) {
          techniques.value = data
          return
        } else {
          await cache.delete(CACHE_KEY)
        }
      }
    } catch (error) {
      console.error('Cache API error:', error)
    }
  }

  const { data } = await supabase.from('Techniques').select('*')
  techniques.value = data as Technique[]

  if (import.meta.client && data) {
    try {
      const cache = await caches.open(CACHE_NAME)
      const cacheData = {
        data,
        timestamp: Date.now()
      }

      const response = new Response(JSON.stringify(cacheData), {
        headers: { 'Content-Type': 'application/json' }
      })

      await cache.put(CACHE_KEY, response)
    } catch (error) {
      console.error('Failed to cache data:', error)
    }
  }
}

function extractUniqueValues(techniques: Technique[]) {
  return [...new Set(techniques.map(t => t.category))].filter(Boolean);
}

const getRecord = (id: number) => {
  selectedRecord.value = techniques.value.find((value: any) => value.id === id)
}

onMounted(async () => {
  await getTechniques()
  availableCategories.value = extractUniqueValues(techniques.value);
})
</script>

<template>
  <main id="leerplan-page">
    <h1>Leerplan</h1>
    <section>
      <div class="technique-list">
        <div class="technique-item" v-for="t in techniques" @click="getRecord(t.id)" :key="t.id">
          <div class="icon-wrapper">
            <IconJudoBelt :size="36" :class-name="(t.belt === '' ? 'fill-secondary-10' : 'fill-' + t.belt)"/>
          </div>
          <div class="title-wrapper">
            <h4>{{ t.name }}</h4>
            <p>{{ t.translation }}</p>
          </div>
        </div>
      </div>
      <div class="technique-container">
        <div class="technique-form">
          <div class="belt-container">
            <div v-for="b in availableBelts" class="icon-wrapper">
              <IconJudoBelt :size="24" :class-name="(b === '' ? 'fill-secondary-10' : 'fill-' + b)"/>
            </div>
          </div>
          <div class="category-container">
            <div v-for="c in availableCategories" class="category-wrapper">
              <p>{{ c }}</p>
            </div>
          </div>
        </div>
        <article v-if="selectedRecord" class="technique-detail">
          <ScriptYouTubePlayer :key="selectedRecord.id" class="video-player" :video-id="selectedRecord.video.replace('https://www.youtube.com/watch?v=', '')">
            <template #awaitingLoad>
              <div class="play-button-wrapper">
                <div class="play-button">
                  <IconPlayTriangle :size="36"/>
                </div>
              </div>
            </template>
          </ScriptYouTubePlayer>
          <div class="technique-detail-info">
            <div class="technique-detail-tags">
              <div class="icon-wrapper">
                <IconJudoBelt :size="24" :class-name="(selectedRecord.belt === '' ? 'fill-secondary-10' : 'fill-' + selectedRecord.belt)"/>
              </div>
              <p>{{ selectedRecord.category }}</p>
            </div>
            <h3>{{ selectedRecord.name }}</h3>
            <p>{{ selectedRecord.translation }}</p>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
#leerplan-page {
  section {
    position: relative;
    display: flex;
    gap: var(--page-margin);

    .technique-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 40rem;
      min-width: 40rem;

      .technique-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: .8rem 1rem;
        border-radius: 1rem;
        background-color: var(--secondary-10);
        backdrop-filter: blur(5px);
        cursor: pointer;
        z-index: 1;

        &:nth-of-type(even) {
          background-color: var(--secondary-20);
        }

        .title-wrapper {
          h4 {
            margin: 0;
            color: var(--secondary);
            font-weight: 500;
            font-size: 2rem;
          }

          p {
            color: var(--accent);
            margin: 0;
          }
        }
      }
    }

    .icon-wrapper {
      display: flex;
      width: fit-content;
      aspect-ratio: 1;
    }

    .technique-detail {
      position: sticky;
      top: 5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      height: fit-content;
      padding: 1rem;
      border-radius: 1rem;
      background-color: var(--secondary-10);
      backdrop-filter: blur(5px);
      z-index: 1;

      .video-player {
        border-radius: .8rem;
        width: 100%;
        overflow: hidden;

        .play-button-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          backdrop-filter: brightness(.6);

          .play-button {
            background-color: var(--accent);
            border-radius: 1.2rem;
            padding: .6rem;
            display: flex;
            justify-content: center;
            align-items: center;

            svg {
              margin-left: .1rem;
            }
          }
        }
      }

      .technique-detail-info {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem;

        h3, p {
          margin: 0;
        }

        .technique-detail-tags {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
      }
    }
  }
}
</style>