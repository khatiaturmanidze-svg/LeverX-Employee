import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['**/*.unit.test.ts'],
        },
      },
      {
        test: {
          name: 'integration',
          environment: 'jsdom',
          include: ['**/*.integration.test.ts'],
        },
      },
    ],
  },
});
