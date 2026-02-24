/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicIconsDir = path.join(__dirname, '..', 'public', 'icons');
const appDir = path.join(__dirname, '..', 'app');

// Create a clean, simple SVG icon that sharp can render
// "SDL" text on a dark background. No rounded corners so iOS and Android maskable works correctly.
const createSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b"/>
      <stop offset="100%" style="stop-color:#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-weight="800" font-size="${Math.round(size * 0.32)}px" 
        fill="white" letter-spacing="${Math.round(size * 0.02)}px">SDL</text>
  <rect x="${Math.round(size * 0.25)}" y="${Math.round(size * 0.72)}" width="${Math.round(size * 0.5)}" height="${Math.round(size * 0.04)}" rx="${Math.round(size * 0.02)}" fill="#22c55e"/>
</svg>`;

async function generateIcons() {
    // Ensure directories exist
    if (!fs.existsSync(publicIconsDir)) {
        fs.mkdirSync(publicIconsDir, { recursive: true });
    }

    const icons = [
        { dir: publicIconsDir, name: 'icon-192.png', size: 192 },
        { dir: publicIconsDir, name: 'icon-512.png', size: 512 },
        { dir: appDir, name: 'apple-icon.png', size: 180 }, // Next.js App Router auto-detects app/apple-icon.png
    ];
    
    for (const { dir, name, size } of icons) {
        const svg = createSvg(size);
        const buf = Buffer.from(svg);
        const outPath = path.join(dir, name);
        
        await sharp(buf)
            .png()
            .toFile(outPath);
        
        const stat = fs.statSync(outPath);
        console.log(`Created ${name}: ${stat.size} bytes in ${dir}`);
    }
    
    console.log('Done! All icons generated.');
}

generateIcons().catch(console.error);
