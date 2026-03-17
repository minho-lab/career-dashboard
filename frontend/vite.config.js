import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import apiPlugin from './server/api-plugin.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // server plugin에서 process.env로 접근할 수 있도록 주입
  if (env.ANTHROPIC_API_KEY) {
    process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY
  }
  return {
    plugins: [vue(), tailwindcss(), apiPlugin()],
  }
})
