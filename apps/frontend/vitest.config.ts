import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
// import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths({
      projects: [fileURLToPath(new URL('./tsconfig.json', import.meta.url))],
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^@app\/(.*)$/,
        replacement: `${fileURLToPath(new URL('./src/app', import.meta.url))}/$1`,
      },
      {
        find: /^@pages\/(.*)$/,
        replacement: `${fileURLToPath(new URL('./src/pages', import.meta.url))}/$1`,
      },
      {
        find: /^@features\/(.*)$/,
        replacement: `${fileURLToPath(new URL('./src/features', import.meta.url))}/$1`,
      },
      {
        find: /^@shared\/(.*)$/,
        replacement: `${fileURLToPath(new URL('./src/shared', import.meta.url))}/$1`,
      },
      {
        find: /^@\/(.*)$/,
        replacement: `${fileURLToPath(new URL('./src', import.meta.url))}/$1`,
      },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './setUpTests.ts',
    include: ['**/*.unit.test.{ts,tsx}', '**/*.integration.test.{ts,tsx}'],
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
  },
});
