<script setup lang="ts">
interface Card {
  japText: string
  title: string
  starred?: boolean
  content?: string
  subContent?: string
  price?: number
}

interface MembershipGroup {
  title: string
  ageGroup: string
  cards: Card[]
}

interface Props {
  groups: MembershipGroup[]
}

const props = defineProps<Props>()

const shouldShowTitle = (index: number) => {
  return index === 0 || props.groups[index]?.title !== props.groups[index - 1]?.title
}
</script>

<template>
  <section class="lidgeld">
    <template v-for="(group, index) in groups" :key="index">
      <h3 v-if="shouldShowTitle(index)">{{ group.title }}</h3>
      <h4>{{ group.ageGroup }}</h4>
      <MoleculeCardList :cards="group.cards"/>
    </template>
  </section>
</template>

<style scoped lang="scss">
.lidgeld {
  h3, h4 {
    margin: 0;
    text-align: center;
  }
}
</style>