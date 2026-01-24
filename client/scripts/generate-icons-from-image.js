import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate all PWA icon sizes from a single source image
 * Place your icon image in client/public/icon-source.png (or .jpg, .svg)
 */
async function generateIconsFromSource() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Look for source image (try common names and formats)
  const possibleSources = [
    'icon-source.png',
    'icon-source.jpg',
    'icon-source.jpeg',
    'icon-source.svg',
    'app-icon.png',
    'app-icon.jpg',
    'app-icon.svg',
    'icon.png',
    'icon.jpg',
    'icon.svg',
  ];
  
  let sourceImage = null;
  for (const name of possibleSources) {
    const filePath = path.join(publicDir, name);
    if (fs.existsSync(filePath)) {
      sourceImage = filePath;
      console.log(`✅ Found source image: ${name}`);
      break;
    }
  }
  
  if (!sourceImage) {
    console.error('❌ No source image found!');
    console.log('\n📝 Please add your icon image to client/public/ with one of these names:');
    possibleSources.forEach(name => console.log(`   - ${name}`));
    console.log('\n💡 Supported formats: PNG, JPG, JPEG, SVG');
    process.exit(1);
  }
  
  // Icon sizes needed for PWA
  const iconSizes = [
    { size: 192, name: 'pwa-192.png' },
    { size: 512, name: 'pwa-512.png' },
    // iOS specific sizes
    { size: 180, name: 'apple-touch-icon-180.png' },
    { size: 167, name: 'apple-touch-icon-167.png' },
    { size: 152, name: 'apple-touch-icon-152.png' },
    { size: 120, name: 'apple-touch-icon-120.png' },
  ];
  
  console.log(`\n🎨 Generating ${iconSizes.length} icon sizes from: ${path.basename(sourceImage)}\n`);
  
  try {
    // Process each size
    for (const icon of iconSizes) {
      const outputPath = path.join(publicDir, icon.name);
      
      await sharp(sourceImage)
        .resize(icon.size, icon.size, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Created: ${icon.name} (${icon.size}x${icon.size})`);
    }
    
    console.log(`\n✅ Successfully generated all ${iconSizes.length} icons!`);
    console.log('\n📱 Icons are ready for:');
    console.log('   - iPhone/iPad (iOS)');
    console.log('   - Android devices');
    console.log('   - Desktop browsers');
    console.log('\n💡 Tip: After deployment, users may need to reinstall the PWA to see the new icon');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIconsFromSource();
