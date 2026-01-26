const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy files to dist
const filesToCopy = [
  { src: 'manifest.json', dest: 'manifest.json' },
  { src: 'popup.html', dest: 'popup.html' },
  { src: 'src/popup.js', dest: 'popup.js' },
  { src: 'src/content.js', dest: 'content.js' },
  { src: 'src/content.css', dest: 'content.css' },
  { src: 'src/background.js', dest: 'background.js' },
];

console.log('Building extension...');

filesToCopy.forEach(({ src, dest }) => {
  const srcPath = path.join(__dirname, src);
  const destPath = path.join(distDir, dest);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✓ Copied ${src} -> dist/${dest}`);
  } else {
    console.warn(`⚠ Warning: ${src} not found`);
  }
});

// Create placeholder icons directory
const iconsDir = path.join(distDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create simple placeholder icon files (SVG as PNG would require dependencies)
// For now, we'll just create empty files - users should replace with actual icons
const iconSizes = [16, 48, 128];
iconSizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon${size}.png`);
  if (!fs.existsSync(iconPath)) {
    // Create a minimal 1x1 transparent PNG
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(iconPath, buffer);
    console.log(`✓ Created placeholder icon${size}.png`);
  }
});

console.log('\n✅ Extension build complete! Output in dist/ directory');
console.log('\nTo load the extension:');
console.log('1. Open Chrome/Edge and go to chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked" and select the dist/ directory');
