/**
 * Vite configuration file
 * Configures build settings and development server
 */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

export default defineConfig(() => {
  // Force development env file
  const env = loadEnv('development', process.cwd(), '')
  const isProduction = false

  return {
    plugins: [react()],
    
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      assetsDir: 'assets',
      sourcemap: !isProduction,
      minify: isProduction,
      target: 'es2015',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            utils: ['axios']
          }
        }
      }
    },

    server: {
      port: parseInt(env.VITE_PORT || '5173'),
      host: '0.0.0.0',
      watch: {
        usePolling: true,
        interval: 1000,
      },
      proxy: {
        '^/api/.*': {
          target: 'http://api:5000',  // Use Docker service name
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        '/socket.io': {
          target: 'http://api:5000',  // Use Docker service name
          ws: true,
          changeOrigin: true
        }
      }
    },

    preview: {
      port: parseInt(env.VITE_PREVIEW_PORT || '4173'),
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: true,
          ws: true
        }
      }
    }
  }
})