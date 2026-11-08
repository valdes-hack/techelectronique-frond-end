import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            // API GET publiques (produits, catégories, réglages) – NetworkFirst avec timeout court
            // Si le serveur est en veille (cold start), sert le cache PWA au bout de 3.5s au lieu de bloquer
            urlPattern: ({ url, request }) => 
              request.method === 'GET' && 
              url.hostname === 'techelectronic-api.onrender.com' &&
              !url.pathname.includes('/cart') &&
              !url.pathname.includes('/admin') &&
              !url.pathname.includes('/auth'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'peoc-api-cache',
              networkTimeoutSeconds: 3.5,
              expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Images Cloudinary – CacheFirst 30 jours (chargement ultra-rapide en PWA)
            urlPattern: /^https:\/\/res\.cloudinary\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-images-cache',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Images locales & assets – cache-first (30 jours)
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Google Fonts – cache-first 1 an
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: "PEOC (Petit Éleveur de l'Ouest Cameroun)",
        short_name: 'PEOC',
        description: "PEOC - Petit Éleveur de l'Ouest Cameroun. Boutique et commandes d'élevage, intrants et matériels.",
        theme_color: '#4f46e5',
        background_color: '#0b0e14',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'fr',
        categories: ['shopping', 'business'],
        icons: [
          { src: '/icons/icon-16x16.png',           sizes: '16x16',   type: 'image/png' },
          { src: '/icons/icon-32x32.png',           sizes: '32x32',   type: 'image/png' },
          { src: '/icons/icon-192x192.png',         sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512x512.png',         sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-icon-512x512.png',sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Catalogue',
            short_name: 'Catalogue',
            url: '/catalog',
            icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Mon Panier',
            short_name: 'Panier',
            url: '/cart',
            icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
          },
        ],
      },
    }),
  ],

  build: {
    // ── OPTIMISATION DU BUNDLE ────────────────────────────────────────────
    // Note: Vite 8 uses rolldown/oxc by default – no esbuild needed
    sourcemap: false,
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // ── CHUNK SPLITTING INTELLIGENT ───────────────────────────────────
        // Sépare le code en petits morceaux chargés à la demande
        manualChunks(id) {
          // Vendor React (critique – chargé en premier)
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          // Vendor router
          if (id.includes('react-router')) {
            return 'vendor-router';
          }
          // Vendor UI (charts, icons, etc.)
          if (id.includes('recharts') || id.includes('lucide-react')) {
            return 'vendor-ui';
          }
          // Vendor HTTP
          if (id.includes('axios')) {
            return 'vendor-http';
          }
          // Vendor formulaires
          if (id.includes('react-hook-form') || id.includes('react-hot-toast') || id.includes('react-select')) {
            return 'vendor-forms';
          }
          // Pages admin (chargées seulement si admin – gros chunk séparé)
          if (id.includes('/pages/admin/')) {
            return 'chunk-admin';
          }
          // Pages client
          if (id.includes('/pages/client/')) {
            return 'chunk-client';
          }
          // Pages auth
          if (id.includes('/pages/auth/')) {
            return 'chunk-auth';
          }
        },
      },
    },
  },

  // Optimiser les dépendances pour le développement
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
})
