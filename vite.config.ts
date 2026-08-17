import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const src = (dir = '') =>
  fileURLToPath(new URL(dir ? `./src/${dir}` : './src', import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: [
      { find: '@ui', replacement: src('components/ui') },
      { find: '@layout', replacement: src('components/layout') },
      { find: '@hero', replacement: src('components/hero') },
      { find: '@about', replacement: src('components/about') },
      { find: '@activity', replacement: src('components/activity') },
      { find: '@contact', replacement: src('components/contact') },
      { find: '@navigation', replacement: src('components/navigation') },
      { find: '@repository', replacement: src('components/repository') },
      { find: '@security-lab', replacement: src('components/security-lab') },
      { find: '@technology', replacement: src('components/technology') },
      { find: '@terminal', replacement: src('components/terminal') },
      { find: '@hooks', replacement: src('hooks') },
      { find: '@lib', replacement: src('lib') },
      { find: '@animations', replacement: src('animations') },
      { find: '@three', replacement: src('three') },
      { find: '@context', replacement: src('context') },
      { find: '@services', replacement: src('services') },
      { find: '@data', replacement: src('data') },
      { find: '@pages', replacement: src('pages') },
      { find: '@/', replacement: `${src()}/` },
    ],
  },
})
