/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  build:  {
    outDir: 'dist',
    lib: {
      entry: 'src/index.ts',
      formats: ['es']
    },
    manifest: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
});
