# PWA Icons

The `icon.svg` in this folder is your base icon. 

## Generate PNG icons

### Option 1: Online (Easiest)
1. Go to https://realfavicongenerator.net
2. Upload `icon.svg`
3. Download the package
4. Copy the generated files here

### Option 2: Command Line
If you have ImageMagick installed:

```bash
# Generate all sizes from SVG
convert icon.svg -resize 192x192 pwa-192x192.png
convert icon.svg -resize 512x512 pwa-512x512.png
convert icon.svg -resize 180x180 apple-touch-icon.png
convert icon.svg -resize 32x32 favicon.ico
```

### Option 3: Use the SVG directly
Modern browsers support SVG favicons. The vite-plugin-pwa will generate 
icons from your SVG during build if you configure it.

## Required Files
- `pwa-192x192.png` - Android/Chrome icon
- `pwa-512x512.png` - Android/Chrome splash
- `apple-touch-icon.png` - iOS home screen (180x180)
- `favicon.ico` - Browser tab icon
