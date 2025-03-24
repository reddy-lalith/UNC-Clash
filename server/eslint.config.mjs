import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import pluginPrettier from "eslint-plugin-prettier";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"] },
  { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.browser } },
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"] },
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { prettier: pluginPrettier },
    rules: {
      "prettier/prettier": "error"
    }
  }
]);