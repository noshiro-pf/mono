import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'docs',
  },
  server: {
    open: '/index.html',
  },
});
