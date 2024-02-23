import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  resolve: {
    alias: [
      { find: '~/components', replacement: '/src/components' },
      { find: '~/lib', replacement: '/src/lib' },
      { find: '~/routers', replacement: '/src/routers' },
      { find: '~/routes', replacement: '/src/routes' },
    ],
  },
});
