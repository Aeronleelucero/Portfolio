import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // React Three Fiber render-loop code intentionally mutates memoized
    // three.js objects (materials, uniforms, geometries) inside useFrame and
    // seeds geometry with Math.random() once. These React Compiler rules don't
    // apply to that imperative pattern (the compiler is not enabled here).
    files: ['src/three/**/*.{js,jsx}'],
    rules: {
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
    },
  },
])
