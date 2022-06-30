/**
 * External depedencies
 */
const path = require('path');
const sharp = require('sharp');
const fs = require('fs-extra');

/**
 * Internal depedencies
 */
const svgPath = path.resolve(__dirname, '..', 'src', 'logo.svg');
const iconsPath = path.resolve(__dirname, '..', 'src', 'extensionIcons');
const targetSizes = [16, 32, 48, 128];

// Build extension icons.
fs.ensureDir(iconsPath).then(generateIcons);

/**
 * Generate extension icons.
 *
 * @since 1.4.0
 */
function generateIcons() {
  targetSizes.forEach((size) => {
    sharp(svgPath)
      .png()
      .resize({ width: size, height: size })
      .toFile(`${iconsPath}/icon-${size}.png`)
      .catch(console.error);
  });
}
