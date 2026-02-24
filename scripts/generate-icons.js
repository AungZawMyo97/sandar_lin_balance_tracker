/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Create a clean, simple SVG icon that sharp can render
// "SDL" text on a dark background with rounded feel
const createSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b"/>
      <stop offset="100%" style="stop-color:#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="url(#bg)"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-weight="800" font-size="${Math.round(size * 0.32)}px" 
        fill="white" letter-spacing="${Math.round(size * 0.02)}px">SDL</text>
  <rect x="${Math.round(size * 0.25)}" y="${Math.round(size * 0.72)}" width="${Math.round(size * 0.5)}" height="${Math.round(size * 0.04)}" rx="${Math.round(size * 0.02)}" fill="#22c55e"/>
</svg>`;

async function generateIcons() {
    const sizes = [
        { name: 'apple-touch-icon.png', size: 180 },
        { name: 'icon-192.png', size: 192 },
        { name: 'icon-512.png', size: 512 },
    ];
    
    for (const { name, size } of sizes) {
        const svg = createSvg(size);
        const buf = Buffer.from(svg);
        
        await sharp(buf)
            .png()
            .toFile(path.join(iconsDir, name));
        
        const fs = require('fs');
        const stat = fs.statSync(path.join(iconsDir, name));
        console.log(`Created ${name}: ${stat.size} bytes`);
    }
    
    console.log('Done! All icons generated.');
}

generateIcons().catch(console.error);
