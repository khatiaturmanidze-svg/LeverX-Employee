import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
  },
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
          setupFiles: './setUpTests.ts',
        },
      },
      {
        test: {
          name: 'integration',
          environment: 'jsdom',
          include: ['**/*.integration.test.ts'],
          globals: true,
          setupFiles: './setUpTests.ts',
        },
      },
    ],
  },
});
