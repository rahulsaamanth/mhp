import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  {
    ignores: [".next/*", "node_modules/*"],
  },
  ...compat.extends(
    "next/core-web-vitals",
    "plugin:react-hooks/recommended",
    "plugin:@tanstack/eslint-plugin-query/recommended"
  ),
  {
    plugins: {
      "@tanstack/query": require("@tanstack/eslint-plugin-query"),
      "react-hooks": require("eslint-plugin-react-hooks"),
    },
    rules: {
      "@tanstack/query/exhaustive-deps": "error",
      "@tanstack/query/no-deprecated-options": "error",
      "@tanstack/query/prefer-query-object-syntax": "error",
      "@tanstack/query/stable-query-client": "error",
    },
  },
]

export default eslintConfig
