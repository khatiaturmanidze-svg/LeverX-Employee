import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.unit.test.ts', '**/*.integration.test.ts', '**/*.d.ts'],
    },
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['**/*.unit.test.ts'],
          globals: true,
        },
      },
      {
        test: {
          name: 'integration',
          environment: 'jsdom',
          include: ['**/*.integration.test.ts'],
          globals: true,
        },
      },
    ],
  },
});
