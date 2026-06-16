import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: { alias: { '@': path.resolve('./src') } },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // focus coverage on the pure logic where it's meaningful (UI islands are e2e-tested)
      include: ['src/utils/**', 'src/models/**'],
    },
  },
})
