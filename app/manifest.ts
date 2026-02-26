import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SDL Daily Balance Tracker',
    short_name: 'SDL Tracker',
    description: 'Daily balance tracking and exchange rate management for SDL',
    start_url: '/login',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/icons/SDL_Icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      }
    ],
  }
}
