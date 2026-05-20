// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

export default defineConfig(
  { ignores: ["dist", ".output", ".nuxt", ".idea"] },

  eslint.configs.recommended,
  tseslint.configs.recommended,

  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
    },
    plugins: {
      vue,
    },
    rules: {},
  },
);
