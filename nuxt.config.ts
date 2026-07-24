// https://nuxt.com/docs/api/configuration/nuxt-config

const baseURL = process.env.NUXT_APP_BASE_URL ?? '/';

export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss", "nuxt-icon", "@nuxt/image", "@pinia/nuxt"],
  devtools: {
    enabled: false // or false to disable
  },
  app: {
    baseURL,
    head: {
      link: [
        { rel: "icon", type: "image/svg+xml", href: `${baseURL}favicon.svg` },
      ],
    },
  },
  css: [
    '@/assets/css/custom-font.css'
    // Other CSS files...
  ],


});
