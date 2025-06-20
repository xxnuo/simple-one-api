import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/admin': {
        target: 'http://localhost:9099',
        changeOrigin: true,
      },
      '/v1': {
        target: 'http://localhost:9099',
        changeOrigin: true,
      }
    }
  }
})
