import { PluginOption, defineConfig } from 'vite';
import { resolve } from 'path';
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  build: {
    outDir: 'build',
    lib: {
      entry: 'src/index.ts',
      formats: ['es']
    },
    manifest: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      plugins: [
        visualizer({
          template: 'sunburst', // or sunburst
          open: false,
          gzipSize: true,
          brotliSize: true,
          filename: 'bundle/analyse.html' // will be saved in project's root
        }) as PluginOption
      ]
    }
  }
});
