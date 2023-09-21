// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss","@nuxtjs/i18n", "nuxt-icon", "@nuxt/image", "@pinia/nuxt"],
  css: [
    '@/assets/css/custom-font.css'
    // Other CSS files...
  ],

  nitro: {
    preset: "firebase"
  },

  runtimeConfig: {
    // Keys within public, will be also exposed to the client-side
    public: {
      PipedriveAPI: process.env.PIPEDRIVE_API_KEY || "PipedriveAPI", //runtimeConfig.public.PipedriveAPI
      GTMContainerAPI: process.env.GTM_CONTAINER_ID || "GTMContainerAPI" //runtimeConfig.public.GTMContainerAPI
    }
  },

  i18n: {
    /* module options */

    lazy: true,
    langDir: "locales",
    strategy: "prefix", //var før, måske en fejl at ændre fra dette: prefix_except_default
    locales: [
      {
        code: "da",
        iso: "da-DK",
        name: "Dansk",
        file: "da-DK.json",
      },
      //{
      //  code: "en",
      //  iso: "en-US",
      //  name: "English",
      //  file: "en-US.json",
      // },
    ],
    defaultLocale: "da",
    vueI18n: {
      fallbackLocale: "da",
    },
    detectBrowserLanguage: {
      useCookie: true, // Use a cookie to remember the user's preference
      cookieKey: "i18n_redirected", // The key for the cookie, mangler opsætning
      alwaysRedirect: true,
      redirectOn: "root",
    },
  }

});
