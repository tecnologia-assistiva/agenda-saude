import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

function copiar404(): Plugin {
  let pastaSaida = 'dist'
  return {
    name: 'agenda-saude:copiar-404',
    apply: 'build',
    configResolved(config) {
      pastaSaida = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      copyFileSync(resolve(pastaSaida, 'index.html'), resolve(pastaSaida, '404.html'))
    },
  }
}

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [vue(), copiar404()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.spec.ts'],
    setupFiles: ['tests/unit/setup.ts'],
    restoreMocks: true,
  },
})