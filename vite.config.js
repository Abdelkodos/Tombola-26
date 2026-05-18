import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'Tombola26',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'Tombola26/index.html'),
        history: resolve(__dirname, 'Tombola26/history.html'),
      },
    },
  },
});
