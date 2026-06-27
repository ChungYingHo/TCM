import astro from 'eslint-plugin-astro'
import svelte from 'eslint-plugin-svelte'
import svelteParser from 'svelte-eslint-parser'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'

// Style rules from CLAUDE.md that must hold everywhere — shared by .ts and the
// <script> blocks of .svelte. Layout rules (indent/eol) are intentionally left
// to the .ts block: ESLint's core `indent` mis-handles Svelte template markup.
const styleRules = {
  quotes: ['error', 'single', { avoidEscape: true }],
  semi: ['error', 'never'],
  // Forbid loose equality everywhere except the `x == null` idiom (matches both
  // null and undefined) — rewriting those to `===` would silently miss undefined.
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  'no-var': 'error',
  'prefer-const': 'error',
  'no-restricted-imports': ['error', { patterns: ['../*', './*'] }],
  '@typescript-eslint/consistent-type-imports': [
    'error',
    { prefer: 'type-imports', disallowTypeAnnotations: false, fixStyle: 'inline-type-imports' },
  ],
}

export default [
  {
    ignores: [
      'dist/**', '.astro/**', '.vercel/**', 'node_modules/**',
      'pipeline/**', '_archive/**', 'src/data/**', 'exams/**',
      'playwright-report/**', 'test-results/**',
    ],
  },

  ...astro.configs.recommended,
  ...svelte.configs.recommended,

  {
    files: ['**/*.{js,ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
    },
    rules: {
      ...styleRules,
      indent: ['error', 2, { SwitchCase: 1 }],
      'eol-last': ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],

      'no-useless-return': 'warn',
      'no-else-return': 'warn',

      'no-console': ['warn', { allow: ['warn', 'error'] }],

      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: { parser: tsParser },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
    },
    rules: {
      ...styleRules,
      // Svelte 5 runes (`let { ... } = $props()`, `$state`, `$derived`) declare
      // with `let` by design even when never reassigned — prefer-const fights the
      // idiom and `$bindable` props must be `let`. Keep it off here only.
      'prefer-const': 'off',
      // Behavioral suggestions from svelte/recommended: kept visible as warnings,
      // not auto-rewritten — each needs per-site verification (reactivity
      // semantics for Map/Set, keyed-each reconciliation, sanitized {@html}).
      'svelte/prefer-svelte-reactivity': 'warn',
      'svelte/require-each-key': 'warn',
      'svelte/prefer-writable-derived': 'warn',
      'svelte/no-at-html-tags': 'warn',
    },
  },

  {
    files: ['**/*.astro'],
    rules: { 'no-console': 'off' },
  },

  {
    files: ['**/*.config.{js,mjs,ts}', 'playwright.config.ts', 'vitest.config.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
]
