import path from 'path';
import { defineConfig } from 'vitest/config';

// https://vitest.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~/': path.resolve(__dirname, './app/'),
    },
  },
  test: {},
});
