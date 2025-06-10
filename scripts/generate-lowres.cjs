const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

const inputDir = '../public/assets/images/works';
const outputDir = '../public/assets/images/works--low';

fs.ensureDirSync(outputDir);

fs.readdirSync(inputDir).forEach(file => {
    if (!file.endsWith('.webp')) return;

    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    sharp(inputPath)
        .resize({ width: 400 }) // adjust as needed
        .jpeg({ quality: 35 }) // or .webp() if you prefer
        .toFile(outputPath)
        
        .then(() => console.log(`✓ ${file}`))
        .catch(err => console.error(`✗ ${file}`, err));
});
