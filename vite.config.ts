import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/plate-mate/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
