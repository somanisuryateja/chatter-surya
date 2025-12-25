import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
  define: {
    // Some libraries use global
    global: 'globalThis',
  },
  server: {
    host: "0.0.0.0", // Expose to network
    proxy: {
      "/api": {
        target: "http://localhost:5001", // Proxy locally to HTTP backend
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://localhost:5001", // Proxy image uploads to backend
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://localhost:5001",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
