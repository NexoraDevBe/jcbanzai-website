<script setup lang="ts">
import { Convert } from "easy-currencies";

const convert = await Convert().from("EUR").fetch();

interface Image {
  src: string
  alt: string
}

interface Card {
  image?: Image
  title?: string
  starred?: boolean
  japText?: string
  price?: number
  content?: string
  subContent?: string
}

interface Props {
  cards: Card[]
}

const props = defineProps<Props>()
const itemCount = ref<number>(props.cards.length)
</script>

<template>
<ul>
  <li v-for="(card, idx) in cards" :key="idx">
    <MoleculeCardItem :image="card.image" :jap-text="card.japText" :title="card.title" :starred="card.starred" :content="card.content" :sub-content="card.subContent" :price="card.price"/>
  </li>
</ul>
</template>

<style scoped lang="scss">
ul {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  width: fit-content;
  margin: 2rem auto 6rem;
  padding: 0;
  list-style: none;

  @media screen and (min-width: 32rem) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 4rem;
  }

  @media screen and (min-width: 64rem) {
    grid-template-columns: repeat(v-bind(itemCount), 1fr);
    gap: 3rem;
  }

  @media screen and (min-width: 80rem) {
    gap: 4rem;
  }
}
</style>