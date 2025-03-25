import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import path from 'path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(), tailwindcss(),
  ],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        devtool: resolve(__dirname, 'devtool/index.html')
      }
    }
  },
  resolve: {
    alias: {
      $: path.resolve('./src'),
      $components: path.resolve('./src/components')
    }
  }
})
