import { defineNuxtConfig } from "nuxt";

// See: https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  typescript: {
    strict: true,
  },

  srcDir: "./src",

  build: {
    transpile: ["motion"],
  },

  buildModules: [
    // See: https://github.com/antfu/unocss
    "@unocss/nuxt",
    // See: https://vueuse.org/
    "@vueuse/nuxt",
  ],

  css: ["@unocss/reset/tailwind.css", "@fontsource/inter/latin.css"],
});
