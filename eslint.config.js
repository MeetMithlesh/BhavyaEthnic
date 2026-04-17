import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'backend',
    'src/components/Categories.jsx',
    'src/components/Collection.jsx',
    'src/components/Footer.jsx',
    'src/components/Header.jsx',
    'src/components/Hero.jsx',
    'src/components/Home.jsx',
    'src/components/NewsLetter.jsx',
    'src/components/ProductDetail.jsx',
    'src/components/ProductGrid.jsx',
    'src/components/PromoBanner.jsx',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },
])
