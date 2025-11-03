<script setup lang="ts">
import {logout} from "~/utils/supabase";

definePageMeta({
  middleware: 'auth'
})
</script>

<template>
<main>
  <section>
    <h1>Hello World!</h1>
    <div class="toggle-mode">
      <button @click="logout" class="link-btn">
        logout
      </button>
    </div>
  </section>
</main>
</template>

<style scoped lang="scss">
</style>