import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/**/*.test.ts', 'apps/**/*.unit.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/deploy/**', '**/*.integration.test.ts'],
    globals: true,
    testTimeout: 20000,
  },
});
