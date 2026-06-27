import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve('./src'),
      // Astro-only virtual module — stub it so middleware.ts is unit-testable.
      'astro:middleware': path.resolve('./src/test/stubs/astro-middleware.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Pure logic + the now-tested server gate (middleware + API routes). UI
      // islands stay e2e-tested.
      include: ['src/utils/**', 'src/models/**', 'src/middleware.ts', 'src/pages/api/**'],
    },
  },
})
