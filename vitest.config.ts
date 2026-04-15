import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// Two-project split:
// - `unit`  : fast text-based codegen/snapshot tests (default for `npm test`).
// - `render`: WASM-backed BOSL2 render smoke tests that actually execute
//             OpenSCAD. Slower; run via `npm run test:render`.
//
// Render tests are excluded from the default `unit` project by filename
// pattern (`*.render.test.*`) so they don't block the fast unit loop.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['**/*.render.test.{ts,tsx}', '**/node_modules/**'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'render',
          include: ['src/**/*.render.test.{ts,tsx}'],
          environment: 'node',
          testTimeout: 120_000,
          hookTimeout: 120_000,
        },
      },
    ],
  },
})
