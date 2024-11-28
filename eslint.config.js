import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [{
  ignores: [
    "eslint.config.js", 
    "dist/**"
  ],
}, ...compat.extends("airbnb-base"), {
  languageOptions: {
    globals: {
      ...globals.node,
    },

    ecmaVersion: 12,
    sourceType: "module",
  },

  rules: {
    "no-console": "off",
    "no-restricted-syntax": ["off", "ForOfStatement"],
    "no-await-in-loop": "off",
  },
}]
