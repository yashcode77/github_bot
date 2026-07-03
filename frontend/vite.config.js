import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174,        // ← Your desired port
    strictPort: true,  // Optional but recommended: fail if port is in use
    // host: true,     // Optional: listen on all addresses (0.0.0.0) for network access
  },
})