import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://cbraunfi.github.io',
  base: '/spd_gallery',
  outDir: './dist',
  build: {
    assets: 'assets'
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash][extname]',
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js'
        }
      }
    }
  }
});
