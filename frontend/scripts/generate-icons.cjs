/**
 * Generates icon-192.png and icon-512.png for PWA "Add to Home Screen".
 * Run before build: node scripts/generate-icons.cjs
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const PUBLIC = path.join(__dirname, '..', 'public');
const COLOR = { r: 59, g: 130, b: 246 }; // #3b82f6

function createPng(size) {
  const png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      png.data[idx] = COLOR.r;
      png.data[idx + 1] = COLOR.g;
      png.data[idx + 2] = COLOR.b;
      png.data[idx + 3] = 255;
    }
  }
  return png;
}

function writePngSync(png, filepath) {
  return new Promise((resolve, reject) => {
    png
      .pack()
      .pipe(fs.createWriteStream(filepath))
      .on('finish', resolve)
      .on('error', reject);
  });
}

async function main() {
  await writePngSync(createPng(192), path.join(PUBLIC, 'icon-192.png'));
  await writePngSync(createPng(512), path.join(PUBLIC, 'icon-512.png'));
  console.log('Generated icon-192.png and icon-512.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
