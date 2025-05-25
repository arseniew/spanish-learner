// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteSingleFile() // Embeds everything into index.html on build
    ],
   build: {
     outDir: 'dist_single',
     // assetsInlineLimit: 4096 // Default limit, increase if needed for large data
   },
   // Remove the optimizeDeps section, it's not needed for standard imports
   // optimizeDeps: { ... }
})