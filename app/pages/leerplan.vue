<script setup lang="ts">
import { getTechniques } from '~/utils/supabase'
import type { Technique } from "~/types";

useHead({
  title: 'Judoclub Banzai - Leerplan & Judo Technieken',
  meta: [
    {
      name: 'description',
      content: 'Ontdek het leerplan en de judo-technieken van Judoclub Banzai. Filter op gordelkleur, categorie of naam en bekijk video’s van worpen, grepen en meer. Ideaal voor elke judoka die zijn kennis wil verdiepen.'
    },
    {
      name: 'keywords',
      content: 'judo technieken, leerplan, Judoclub Banzai, worpen, grepen, judo video’s, judo gordels, judo oefenen, judo leerplan, Gavere, Nazareth'
    },
    {
      property: 'og:title',
      content: 'Judoclub Banzai - Leerplan & Judo Technieken'
    },
    {
      property: 'og:description',
      content: 'Bekijk het volledige leerplan van Judoclub Banzai: technieken per gordel, categorie en met video-uitleg. Voor judoka’s van alle niveaus.'
    },
    {
      property: 'og:type',
      content: 'website'
    }
  ],
})

const techniques = ref<Technique[]>([]);
const availableBelts = ref<string[]>(['yellow', 'orange', 'green', 'blue', 'brown', 'black']);
const availableCategories = ref<string[]>([]);
const selectedRecord = ref<Technique>()
const beltFilter = ref<string>('')
const categoryFilter = ref<string>('')
const searchFilter = ref<string>('')
const detailRef = ref<HTMLInputElement | null>(null)

function extractUniqueValues(techniques: Technique[]) {
  return [...new Set(techniques.map(t => t.category))].filter(Boolean);
}

const getRecord = (id: number) => {
  selectedRecord.value = techniques.value.find((value: any) => value.id === id)
  const remInPixels = 64 * parseFloat(getComputedStyle(document.documentElement).fontSize)
  if (window.innerWidth < remInPixels) {
    scrollTo(0, 0)
  }
}

const filteredTechniques = computed(() => {
  return techniques.value.filter((t) => {
    const matchesBelt = !beltFilter.value || t.belt === beltFilter.value
    const matchesCategory = !categoryFilter.value || t.category === categoryFilter.value
    const matchesSearch = !searchFilter.value.trim() || t.name.toLowerCase().search(searchFilter.value.trim().toLowerCase()) >= 0 || t.translation.toLowerCase().search(searchFilter.value.trim().toLowerCase()) >= 0

    return matchesBelt && matchesCategory && matchesSearch
  })
})

const filterRecordsBelt = (belt: string) => {
  beltFilter.value = beltFilter.value === belt ? '' : belt
}

const filterRecordsCategory = (category: string) => {
  categoryFilter.value = categoryFilter.value === category ? '' : category
}

onMounted(async () => {
  techniques.value = await getTechniques()
  getRecord(Math.ceil(Math.random() * techniques.value.length))
  availableCategories.value = extractUniqueValues(techniques.value);
})
</script>

<template>
  <main id="leerplan-page">
    <h1>Leerplan</h1>
    <section>
      <div class="technique-form">
        <div class="belt-container">
          <div v-for="b in availableBelts" @click="filterRecordsBelt(b)" :key="b" class="icon-wrapper" :class="{'active': b === beltFilter}">
            <IconJudoBelt :size="24" :class-name="(b === '' ? 'fill-secondary-10' : 'fill-' + b)"/>
          </div>
        </div>
        <div class="category-container">
          <div v-for="c in availableCategories" @click="filterRecordsCategory(c)" :key="c" class="category-wrapper" :class="{'active': c === categoryFilter}">
            <p>{{ c }}</p>
          </div>
        </div>
        <div class="search-container">
          <input type="text" name="search" aria-placeholder="Zoek technieken" placeholder="Zoek technieken" v-model="searchFilter" id="search-input">
          <button @click="() => {beltFilter = ''; categoryFilter = ''; searchFilter = ''}">
            wis filters
          </button>
        </div>
      </div>
      <div class="technique-list">
        <div class="technique-item" v-for="t in filteredTechniques" @click="getRecord(t.id)" :key="t.id">
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
@mixin card-base {
  border-radius: 1rem;
  background-color: var(--secondary-10);
  backdrop-filter: blur(5px);
  z-index: 1;
}

@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin clickable-filter {
  cursor: pointer;
  background-color: var(--secondary-10);
  border-radius: .6rem;

  &.active {
    background-color: var(--secondary-40);
  }
}

.icon-wrapper {
  display: flex;
  width: fit-content;
  aspect-ratio: 1;
}

#leerplan-page {
  section {
    position: relative;
    display: flex;
    flex-direction: column-reverse;
    gap: var(--page-margin);
    z-index: 1;

    .technique-form {
      @include card-base;
      position: relative;
      display: flex;
      flex-direction: column;
      order: 1;
      gap: 1rem;
      width: 100%;
      max-width: 64rem;
      height: fit-content;
      margin: var(--page-margin) auto;
      padding: 1rem;

      .belt-container {
        @include flex-center;
        flex-wrap: wrap;
        gap: .5rem;

        .icon-wrapper {
          @include clickable-filter;
          padding: .6rem;
        }
      }

      .category-container {
        @include flex-center;
        flex-wrap: wrap;
        gap: .5rem;

        .category-wrapper {
          @include clickable-filter;
          width: fit-content;
          min-width: 5rem;
          padding: .5rem 1rem;

          p {
            text-align: center;
            margin: 0;
            user-select: none;
          }
        }
      }

      .search-container {
        display: flex;
        gap: .5rem;
        width: 100%;

        input, button {
          padding: .5rem 1rem;
          border: none;
          font-family: 'Rokkitt', Arial, serif;
          font-size: 1.2rem;
          border-radius: .6rem;
          color: var(--secondary);
        }

        input {
          width: 100%;
          background-color: var(--secondary-30);
        }

        button {
          min-width: max-content;
          background-color: var(--secondary-10);
          cursor: pointer;

          &:hover {
            background-color: var(--accent-60);
          }
        }
      }
    }

    .technique-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;

      .technique-item {
        @include card-base;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: .8rem 1rem;
        cursor: pointer;

        &:nth-of-type(even) {
          background-color: var(--secondary-20);
        }

        .title-wrapper {
          h4 {
            margin: 0;
            color: var(--secondary);
            font-weight: 500;
            font-size: 1.4rem;
          }

          p {
            margin: 0;
            color: var(--accent);
            font-size: 1.2rem;
          }
        }
      }
    }

    .technique-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      order: 2;

      .technique-detail {
        @include card-base;
        top: 5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
        height: fit-content;
        padding: 1rem;
        background-color: var(--secondary-20);

        .video-player {
          width: 100%;
          border-radius: .8rem;
          overflow: hidden;

          .play-button-wrapper {
            @include flex-center;
            position: absolute;
            inset: 0;
            backdrop-filter: brightness(.6);

            .play-button {
              @include flex-center;
              background-color: var(--accent);
              border-radius: 1.2rem;
              padding: .6rem;

              svg {
                margin-left: .1rem;
              }
            }
          }
        }

        .technique-detail-info {
          display: flex;
          flex-direction: column;
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
}

// Desktop layout
@media screen and (min-width: 64rem) {
  #leerplan-page section {
    display: grid;
    grid-template-columns: minmax(35%, 40rem) minmax(50%, 70%);

    .technique-form {
      grid-column: 1 / -1;
      grid-row: 1;
      margin: 0 auto;

      .belt-container {
        gap: 1rem;
      }

      .category-container {
        gap: 1rem;
      }

      .search-container {
        gap: 1rem;
      }
    }

    .technique-container .technique-detail {
      position: sticky;
    }
  }
}
</style>
