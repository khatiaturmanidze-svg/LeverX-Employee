import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
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
      exclude: [
        '**/*.unit.test.{ts,tsx}',
        '**/*.integration.test.{ts,tsx}',
        '**/*.d.ts',
      ],
    },
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['**/*.unit.test.{ts,tsx}'],
          setupFiles: './setUpTests.ts',
        },
      },
      {
        test: {
          name: 'integration',
          environment: 'jsdom',
          include: ['**/*.integration.test.{ts,tsx}'],
          globals: true,
          setupFiles: './setUpTests.ts',
        },
      },
    ],
  },
});
