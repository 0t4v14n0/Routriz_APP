import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- Adicione esta linha
import { VitePWA } from 'vite-plugin-pwa'; 

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- Adicione esta linha
    VitePWA({
      registerType: 'autoUpdate', // Atualiza o app sozinho quando você lançar versão nova
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Roteiriza Entregas',
        short_name: 'Roteiriza',
        description: 'App de otimização de rotas para entregadores',
        theme_color: '#2563EB',
        background_color: '#ffffff',
        start_url: '/login',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192x192.png', // <-- Mude para o seu arquivo PNG
            sizes: '192x192',
            type: 'image/png' // <-- Aviso de que é PNG
          },
          {
            src: '/icon-512x512.png', // <-- Mude para o seu arquivo PNG
            sizes: '512x512',
            type: 'image/png', // <-- Aviso de que é PNG
            purpose: 'any maskable' // <-- (Dica Extra) Isso deixa o ícone arredondado bonito no Android!
          }
        ]
      }
    })
  ]
});