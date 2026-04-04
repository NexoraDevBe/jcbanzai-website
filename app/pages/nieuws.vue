<script setup lang="ts">
import type {News} from "~/types";

onMounted(async () => {
  await newsStore.fetchNewsposts()
})

const newsStore = useNewsStore()

const posts = computed<News[]>(() => newsStore.newsposts.filter((n) => n.post))
const postsTest = [
  {
    title: "dsfqkkf jdsfq",
    description: "dsfqkkj dsfq dsfqkkjdsf dsfqk kjdsfqd sfqkkj sfqdsfqkk jdsfqds fqkk  jdsfqd sfqkkj dsf qdsfqkkjdsfq  dsfqkk jdsfqdsfqkkjdsfqds fqkkjdsfqds  fqkkjdsfqdsfqk kjd sfqdsfqkkjd sfqdsfqkkjdsfq  dsf qkkjds fqdsfqkkjdsf qdsfqkkjdsf qdsfqkkj dsfqdsfqkkjdsf qdsfqkkjdsfqds fqkkjdsfq",
    img_url: "https://images.pexels.com/photos/35911195/pexels-photo-35911195.jpeg",
    date: "2018-05-01"
  },
  {
    title: "dsfqkkjds  f fq",
    description: "dsfqkkj dsfq dsfqkkjdsf dsdsfqkkjdsf dsfqk kjdsfqd sfqkkj sfqdsfqkk jdsfqds fqkk  jdsfqd sfqkkj dsf qdsfqkkjdsfq  dsf  jdsfqd sfqkkj dsf qdsfqkkjdsfq  dsfqkk jdsfqdsfqkkjdsfqds fqkkjdsfqds  fqkkjdsfqdsfqk kjd sfqdsfqkkjd sfqdsfqkkjdsfq  dsf qkkjds fqdsfqkkjdsf qdsfqkkjdsf qdsfqkkj dsfqdsfqkkjdsf qdsfqkkjdsfqds fqkkjdsfq",
    img_url: "https://images.pexels.com/photos/35911195/pexels-photo-35911195.jpeg",
    date: "2018-05-01"
  },
  {
    title: "dsfqkkjds fgg dgdfgdgdgg  fq",
    description: "dsfqkkj dsfq dsfqkkjdsf dsfqk kjdsfqd sfqkkj sfqdsfqkk jdsfqds fqkk  jdsfqd sfqkkj dsf qdsfqkkjdsfq  dsfqkk jdsfqdsfqkkjdsfqds fqkkjdsfqds  fqkkjdsfqdsfqk kjd sfqdsfqkkjd sfqdsfqkkjdsfq  dsf qkkjds fqdsfqkkjdsf qdsfqkkjdsf qdsfqkkj dsfqdsfqkkjdsf qdsfqkkjdsfqds fqkkjdsfq",
    img_url: "https://images.pexels.com/photos/35911195/pexels-photo-35911195.jpeg",
    date: "2018-05-01"
  },
  {
    title: "ddfg  fsfqkg kjdsfq",
    description: "dsfqkkj dsfq qkk jdsfqdsfqkkjdsfqds fqkkjdsfqds  fqkkjdsfqdsfqk kjd sfqdsfqkkjd sfqdsfqkkjdsfq  dsf qkkjds fqdsfqkkjdsf qdsfqkkjdsf qdsfqkkj dsfqdsfqkkjdsf qdsfqkkjdsfqds fqkkjdsfq",
    img_url: "https://images.pexels.com/photos/35911195/pexels-photo-35911195.jpeg",
    date: "2018-05-01"
  },
  {
    title: "dsfqddd ddkkjdsfq",
    description: "dsfqkkj dsfq dsfqkkjdsf dsfqk kjdsfqd dsfqkkjdsf dsfqk kjdsfqd sfqkkj sfqdsfqkk jdsfqds fqkk  jdsfqd sfqkkj dsf qdsfqkkjdsfq  dsf sfqkkj sfqdsfqkk jdsfqds fqkk  jdsfqd sfqkkj dsf qdsfqkkjdsfq  dsfqkk jdsfqdsfqkkjdsfqds fqkkjdsfqds  fqkkjdsfqdsfqk kjd sfqdsfqkkjd sfqdsfqkkjdsfq  dsf qkkjds fqdsfqkkjdsf qdsfqkkjdsf qdsfqkkj dsfqdsfqkkjdsf qdsfqkkjdsfqds fqkkjdsfq",
    img_url: "https://images.pexels.com/photos/35911195/pexels-photo-35911195.jpeg",
    date: "2018-05-01"
  },
  {
    title: "dsfqkkjfgdgdsfq",
    description: "dsfqkkj dsfq dsfqkkjdsf dsfqk kjdsfqd sfqkkj dsfqkkjdsf dsfqk kjdsfqd sfqkkj sfqdsfqkk jdsfqds fqkk  jdsfqd sfqkkj dsf qdsfqkkjdsfq  dsfdsfqkkjdsf dsfqk kjdsfqd sfqkkj sfqdsfqkk jdsfqds fqkk  jdsfqd sfqkkj dsf qdsfqkkjdsfq  dsfsfqdsfqkk jdsfqds fqkk  jdsfqd sfqkkj dsf qdsfqkkjdsfq  dsfqkk jdsfqdsfqkkjdsfqds fqkkjdsfqds  fqkkjdsfqdsfqk kjd sfqdsfqkkjd sfqdsfqkkjdsfq  dsf qkkjds fqdsfqkkjdsf qdsfqkkjdsf qdsfqkkj dsfqdsfqkkjdsf qdsfqkkjdsfqds fqkkjdsfq",
    img_url: "https://images.pexels.com/photos/35911195/pexels-photo-35911195.jpeg",
    date: "2018-05-01"
  },
]
</script>

<template>
  <main id="nieuws-page">
    <h1>Nieuws</h1>
    <MoleculeMasonryGrid :items="posts">
      <template #default="{ item }">
        <MoleculeNewsCard :post="item as News" />
      </template>
    </MoleculeMasonryGrid>
  </main>
</template>

<style scoped lang="scss">
#nieuws-page {
  min-height: 40vh;
}
</style>