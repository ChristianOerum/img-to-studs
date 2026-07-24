// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss", "nuxt-icon", "@nuxt/image", "@pinia/nuxt"],
  devtools: {
    enabled: false // or false to disable
  },
  app: {
    head: {
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      ],
    },
  },
  css: [
    '@/assets/css/custom-font.css'
    // Other CSS files...
  ],


});
