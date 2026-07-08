
import react from '@vitejs/plugin-react';
import path from 'path';

// Middleware plugin to redirect client-side routes to their correct entry HTML files in development
const mpaFallbackPlugin = () => ({
  name: 'mpa-fallback',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url || '';
      const accept = req.headers.accept || '';
      if (req.method === 'GET' && accept.includes('text/html')) {
        if (url.startsWith('/admin')) {
          req.url = '/admin/index.html';
        } else {
          req.url = '/index.html';
        }
      }
      next();
    });
  }
});

export default defineConfig({
  plugins: [react(), mpaFallbackPlugin()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared'),
      '@user': path.resolve(__dirname, './user/src'),
      '@admin': path.resolve(__dirname, './admin/src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'admin/index.html'),
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
