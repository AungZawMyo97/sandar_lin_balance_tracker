import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SDL Daily Balance Tracker',
    short_name: 'SDL Tracker',
    description: 'Daily balance tracking and exchange rate management for SDL',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/SDL_Icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      }
    ],
  }
}
