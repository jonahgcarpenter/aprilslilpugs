import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve(__dirname, '..'), '');
  const isProduction = mode === 'production';

  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: '../server/static',
      emptyOutDir: true,
      sourcemap: !isProduction,
      minify: isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom']
          }
        }
      }
    },
    server: {
      port: parseInt(env.VITE_DEV_PORT || '5173'),
      host: env.VITE_DEV_HOST || 'localhost',
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});