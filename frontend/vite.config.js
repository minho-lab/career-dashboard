import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import apiPlugin from './server/api-plugin.js'

export default defineConfig({
  plugins: [vue(), tailwindcss(), apiPlugin()],
})
