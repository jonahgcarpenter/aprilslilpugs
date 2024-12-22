/**
 * Vite configuration file
 * Configures build settings and development server
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: '/', // Ensures absolute paths for all assets
  plugins: [react()],
  
  // Build configuration
  build: {
    outDir: 'dist', // Output folder for production build
    emptyOutDir: true,
    assetsDir: 'assets', // Directory for static assets
    sourcemap: process.env.NODE_ENV === 'development', // Source maps in development for debugging
  },
  
  // Development server configuration
  server: {
    port: 5173, // Match the port backend expects
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  
  // Production optimizations
  esbuild: {
    drop: ['console', 'debugger'], // Remove logs and debuggers in production
  },
})
