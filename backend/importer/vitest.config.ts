import {
  configDefaults,
  defineConfig,
} from "vitest/config";

export default defineConfig({
  test: {
    exclude: [
      ...configDefaults.exclude,

      "**/dist/**",

      "**/coverage/**",

      "**/.git/**",
      "**/.cache/**",
      "**/.temp/**",
      "**/.output/**",
    ],

    include: [
      "**/*.{test,spec}.ts",
    ],
  },
});