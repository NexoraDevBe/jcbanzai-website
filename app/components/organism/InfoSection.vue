<script setup lang="ts">
interface InfoSection {
  japText: string
  title: string
  content: string
  right: boolean
}

interface Props {
  sections: InfoSection[]
}

defineProps<Props>()
</script>

<template>
  <section class="info">
    <div class="paragraph-container">
      <MoleculeStyledParagraph
          v-for="(section, index) in sections"
          :key="index"
          class="paragraph"
          :right="section.right"
          :max-width="'30rem'"
      >
        <template #styleElement>
          <AtomJapaneseText :vertical="true" :size="3" :outline="true">
            {{ section.japText }}
          </AtomJapaneseText>
        </template>
        <template #title>
          {{ section.title }}
        </template>
        <template #content>
          <div v-html="section.content" />
        </template>
      </MoleculeStyledParagraph>
    </div>
    <AtomJapaneseText class="japanese-text" :vertical="true" :size="5" :outline="true">
      スタート
    </AtomJapaneseText>
  </section>
</template>

<style scoped lang="scss">
.info {
  display: flex;
  align-items: center;
  margin: 0 calc(var(--page-margin)*2) 4rem;

  .paragraph-container {
    display: flex;
    flex-direction: column;
    gap: 4rem;
    width: 100%;

    .paragraph:nth-child(even) {
      align-self: flex-end;
    }
  }

  .japanese-text {
    display: none;
  }
}

@media screen and (width >= 80rem) {
  .info {
    margin: 0 8rem 4rem;
    gap: 8rem;

    .japanese-text {
      display: block;
    }
  }
}

@media screen and (width >= 90rem) {
  .info {
    margin: 0 12rem 4rem;
    gap: 12rem;
  }
}
</style>