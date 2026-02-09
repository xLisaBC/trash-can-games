import { defineConfig } from 'vite';

export default defineConfig({
  base: '/trash-can-games/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    minify: 'esbuild',
    target: 'es2020',
  },
  esbuild: {
    keepNames: true,
  }
});