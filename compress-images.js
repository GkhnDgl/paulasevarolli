const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'images');
const TARGET_WIDTH = 1920;
const QUALITY = 95;

async function compressImage(filename) {
  const inputPath = path.join(imagesDir, filename);
  const outputPath = path.join(imagesDir, filename);

  if (!fs.existsSync(inputPath)) return;

  const stats = fs.statSync(inputPath);
  const sizeMB = stats.size / (1024 * 1024);

  if (sizeMB < 0.1) return;

  console.log(`Compressing ${filename} (${sizeMB.toFixed(2)} MB) with quality ${QUALITY}...`);

  try {
    await sharp(inputPath)
      .resize(TARGET_WIDTH, null, { withoutEnlargement: true })
      .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
      .toFile(outputPath + '.tmp');

    fs.renameSync(outputPath + '.tmp', outputPath);

    const newStats = fs.statSync(outputPath);
    const newSizeMB = newStats.size / (1024 * 1024);
    console.log(`  → ${filename}: ${newSizeMB.toFixed(2)} MB`);
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`);
  }
}

async function main() {
  const files = fs.readdirSync(imagesDir)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  for (const file of files) {
    await compressImage(file);
  }

  console.log('\nDone.');
}

main().catch(console.error);