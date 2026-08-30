<script setup lang="ts">
import type { News } from '~/types';

defineProps<{
  post: News;
}>();
</script>

<template>
  <div class="alert-card">
    <h4 class="title">{{ post.title }}</h4>
    <p v-if="post.description" class="description">
      {{ post.description }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.alert-card {
  background: var(--warning-10);
  backdrop-filter: blur(10px);
  border: 1px solid var(--warning);

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.6rem;

  width: 100%;
  height: fit-content;
  padding: 0.3rem 0.6rem;
  border-radius: 0.5rem;

  @media screen and (width >= 64rem) {
    padding: 1.2rem;
    border-radius: 1rem;
    height: fit-content;
  }

  .title,
  .date,
  .description {
    margin: 0;
  }
  .title {
    font-size: 0.8rem;
    color: var(--secondary);

    @media screen and (width >= 64rem) {
      font-size: 1.3rem;
    }
  }
  .description {
    font-size: 1rem;
    display: none;

    @media screen and (width >= 64rem) {
      display: block;
    }
  }
  .date {
    color: var(--gray-500);
  }
}
</style>
