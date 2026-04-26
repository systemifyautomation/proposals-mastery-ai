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
  { src: 'settings.html', dest: 'settings.html' },
  { src: 'test-youtube.html', dest: 'test-youtube.html' },
  { src: 'src/popup.js', dest: 'popup.js' },
  { src: 'src/settings.js', dest: 'settings.js' },
  { src: 'src/storage.js', dest: 'storage.js' },
  { src: 'src/test-youtube.js', dest: 'test-youtube.js' },
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

// Copy SVG icons if they exist
const srcIconsDir = path.join(__dirname, 'icons');
if (fs.existsSync(srcIconsDir)) {
  const iconFiles = fs.readdirSync(srcIconsDir);
  iconFiles.forEach(file => {
    const srcIcon = path.join(srcIconsDir, file);
    const destIcon = path.join(iconsDir, file);
    fs.copyFileSync(srcIcon, destIcon);
    console.log(`✓ Copied icons/${file}`);
  });
} else {
  // Create minimal placeholder icons
  const iconSizes = [16, 48, 128];
  const PLACEHOLDER_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  
  iconSizes.forEach(size => {
    const iconPath = path.join(iconsDir, `icon${size}.png`);
    if (!fs.existsSync(iconPath)) {
      const buffer = Buffer.from(PLACEHOLDER_PNG_BASE64, 'base64');
      fs.writeFileSync(iconPath, buffer);
      console.log(`✓ Created placeholder icon${size}.png`);
    }
  });
}

console.log('\n✅ Extension build complete! Output in dist/ directory');
console.log('\nTo load the extension:');
console.log('1. Open Chrome/Edge and go to chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked" and select the dist/ directory');
