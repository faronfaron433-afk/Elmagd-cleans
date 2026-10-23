import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// Path for persistent catalog data
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'catalog.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      ensureDataFile();

      server.middlewares.use((req, res, next) => {
        const url = req.url || '';

        if (!url.startsWith('/api/')) {
          return next();
        }

        // Helper to read body
        const readBody = (callback: (data: any) => void) => {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              callback(body ? JSON.parse(body) : {});
            } catch (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
        };

        // Response helper
        const sendJson = (status: number, data: any) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.end(JSON.stringify(data));
        };

        // 1. GET /api/catalog
        if (req.method === 'GET' && url.startsWith('/api/catalog')) {
          try {
            if (fs.existsSync(DATA_FILE)) {
              const content = fs.readFileSync(DATA_FILE, 'utf-8');
              const data = JSON.parse(content);
              return sendJson(200, data);
            }
            return sendJson(404, { notFound: true });
          } catch (e: any) {
            return sendJson(500, { error: e.message });
          }
        }

        // 2. POST /api/catalog (save entire catalog)
        if (req.method === 'POST' && url.startsWith('/api/catalog')) {
          readBody((data) => {
            try {
              ensureDataFile();
              data.lastModified = new Date().toISOString();
              fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
              return sendJson(200, { success: true, lastModified: data.lastModified });
            } catch (e: any) {
              return sendJson(500, { error: e.message });
            }
          });
          return;
        }

        // 3. GET /api/sync (lightweight heartbeat)
        if (req.method === 'GET' && url.startsWith('/api/sync')) {
          try {
            if (fs.existsSync(DATA_FILE)) {
              const stat = fs.statSync(DATA_FILE);
              return sendJson(200, {
                lastModified: stat.mtime.toISOString(),
                size: stat.size,
              });
            }
            return sendJson(200, { lastModified: null });
          } catch (e: any) {
            return sendJson(500, { error: e.message });
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'منظفات المجد - الأسعار والمخزون',
          short_name: 'منظفات المجد',
          description: 'الموقع والتطبيق الرسمي لمحل منظفات المجد: استعلام فوري وتنبيهات بأسعار ومخزون المنظفات للمدير والعمال والزبائن.',
          theme_color: '#0d9488',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      apiServerPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
