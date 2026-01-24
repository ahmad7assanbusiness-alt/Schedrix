# How to Add Your Custom App Icon

## Quick Steps:

1. **Add your image** to `client/public/` folder with one of these names:
   - `icon-source.png` (recommended)
   - `icon-source.jpg`
   - `app-icon.png`
   - `icon.png`

2. **Run the generation script:**
   ```bash
   cd client
   node scripts/generate-icons-from-image.js
   ```

3. **That's it!** The script will automatically:
   - Find your source image
   - Generate all required sizes (192, 512, 180, 167, 152, 120)
   - Create icons for iPhone, iPad, Android, and Desktop

## Image Requirements:
- **Format**: PNG, JPG, or SVG
- **Recommended size**: At least 512x512 pixels (larger is better)
- **Shape**: Square works best (will be cropped to square if needed)
- **Background**: Transparent or solid color

## After generating:
- Icons will be automatically used in the PWA
- Users may need to reinstall the app to see the new icon
