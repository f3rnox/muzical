import packageJson from "eslint-plugin-package-json"
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ['docs/**']
  },
  {
    files: ["**/*.ts"],
    plugins: {
      js
    },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.browser
    }
  },
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  packageJson.configs.recommended
]);
