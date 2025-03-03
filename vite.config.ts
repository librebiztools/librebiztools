import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/config';

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: './server/app.ts',
        }
      : undefined,
  },
  plugins: [
    tailwindcss(),
    process.env.NODE_ENV === 'test' ? null : reactRouter(),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    exclude: ['@node-rs/argon2'],
  },
  server: {
    port: 3000,
  },
  test: {
    setupFiles: ['./test/setup.ts'],
    exclude: [...configDefaults.exclude, 'e2e/*'],
  },
}));
