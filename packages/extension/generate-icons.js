// Simple icon generation script
const fs = require('fs');
const path = require('path');

// Create a simple SVG icon and save as different sizes
const sizes = [16, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(size => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#14a800"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size*0.6}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">P</text>
</svg>`;
  
  fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), svg);
  console.log(`✓ Created icon${size}.svg`);
});

console.log('\n✅ All icons created! Note: Chrome extensions prefer PNG, but SVG will work for testing.');
console.log('For production, convert SVG to PNG using an image converter.');
