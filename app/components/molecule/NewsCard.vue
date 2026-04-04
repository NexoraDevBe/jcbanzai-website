<script setup lang="ts">
export interface NewsPost {
  title: string
  description: string
  date: string
  img_url?: string
}

defineProps<{ post: NewsPost }>()
</script>

<template>
  <div class="news-card">
    <div v-if="post.img_url" class="news-card-image">
      <img :src="post.img_url" :alt="post.title">
    </div>
    <div class="news-card-content">
      <h4 class="title">{{ post.title }}</h4>
      <h5 class="date">{{ post.date }}</h5>
      <p class="description">{{ post.description }}</p>
    </div>
  </div>
</template>

<style scoped>
.news-card {
  position: relative;
  z-index: 1;
  background: var(--secondary-10);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  overflow: hidden;

  .news-card-image {
    padding: 1rem 1rem 0;
    width: 100%;
    height: 20rem;

    img {
      border-radius: .8rem;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .news-card-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 2rem;

    .title, .date, .description { margin: 0; }
    .title { font-size: 2rem; }
    .date { color: var(--gray-500); }
  }
}
</style>