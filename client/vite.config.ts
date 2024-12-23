/**
 * Vite configuration file
 * Configures build settings and development server
 */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'

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
      host: false,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: isProduction,
          ws: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        },
        '/socket.io': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          ws: true
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