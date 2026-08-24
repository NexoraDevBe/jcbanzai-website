// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  css: ['~/assets/scss/main.scss'],

  app: {
    head: {
      title: 'Judoclub Banzai',
      htmlAttrs: {
        lang: 'nl',
      },
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  runtimeConfig: {
    public: {
      supabaseUrl: 'https://dxakjqfsxazwzyrhfoqn.supabase.co',
      supabaseAnonKey:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4YWtqcWZzeGF6d3p5cmhmb3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzM1MTksImV4cCI6MjA3NDY0OTUxOX0.OHEfthLPPwbhuFM1fOPDeq9bwiPjb_PxnQSgtZ8WyOQ',
    },
  },

  modules: ['@nuxt/scripts', '@pinia/nuxt', '@peterbud/nuxt-query', '@vueuse/nuxt'],

  pinia: {
    storesDirs: ['./stores/**'],
  },
});
