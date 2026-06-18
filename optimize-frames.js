import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, 'public', 'assets', 'images');
const outputDir = path.join(__dirname, 'public', 'assets', 'sequence');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function optimizeImages() {
  try {
    const files = fs.readdirSync(inputDir).filter(f => f.match(/\.(png|jpe?g)$/i));
    // Sort files alphabetically to ensure chronological order
    files.sort();

    console.log(`Found ${files.length} images. Starting optimization...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const inputPath = path.join(inputDir, file);
      const frameNumber = String(i + 1).padStart(4, '0');
      const outputPath = path.join(outputDir, `frame_${frameNumber}.webp`);

      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);

      console.log(`Converted ${file} -> frame_${frameNumber}.webp`);
    }

    console.log('Successfully optimized all frames!');
  } catch (error) {
    console.error('Error optimizing images:', error);
  }
}

optimizeImages();
