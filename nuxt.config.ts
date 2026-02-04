// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/main.css'],
  runtimeConfig: {
    public: {
      medusaBaseUrl: process.env.NUXT_PUBLIC_MEDUSA_BASE_URL || 'http://localhost:9000',
      medusaPublishableKey: process.env.NUXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
    }
  }
})
