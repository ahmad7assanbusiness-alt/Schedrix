import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a proper PNG icon with Opticore branding
 * Creates a gradient background with "O" logo
 */
function generateIconSVG(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-size="${size * 0.5}" 
    font-weight="bold" 
    fill="white" 
    text-anchor="middle" 
    dominant-baseline="central"
    letter-spacing="-0.05em"
  >O</text>
</svg>`;
}

/**
 * Create PNG icon from SVG
 */
async function createIcon(size, filename) {
  try {
    const svg = generateIconSVG(size);
    const svgBuffer = Buffer.from(svg);
    
    // Convert SVG to PNG using sharp
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(filename);
    
    console.log(`✅ Created PNG icon: ${filename} (${size}x${size})`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating ${filename}:`, error.message);
    return false;
  }
}

// Generate all required icon sizes
const publicDir = path.join(__dirname, '..', 'public');

console.log('🎨 Generating Opticore PWA icons...\n');

async function generateAllIcons() {
  const icons = [
    { size: 192, name: 'pwa-192.png' },
    { size: 512, name: 'pwa-512.png' },
    // iOS specific sizes
    { size: 180, name: 'apple-touch-icon-180.png' },
    { size: 167, name: 'apple-touch-icon-167.png' },
    { size: 152, name: 'apple-touch-icon-152.png' },
    { size: 120, name: 'apple-touch-icon-120.png' },
  ];

  const results = await Promise.all(
    icons.map(icon => createIcon(icon.size, path.join(publicDir, icon.name)))
  );

  const successCount = results.filter(r => r).length;
  
  console.log(`\n✅ Successfully generated ${successCount}/${icons.length} icons!`);
  console.log('\n📱 Icons are ready for PWA installation on:');
  console.log('   - iPhone/iPad (iOS)');
  console.log('   - Android devices');
  console.log('   - Desktop browsers');
}

generateAllIcons().catch(console.error);
