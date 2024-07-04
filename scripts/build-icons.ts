import 'dotenv/config';
import * as path from 'path';
import * as fs from 'fs-extra';
import sharp from 'sharp';

const svgPath: string = path.resolve(__dirname, '..', 'src', 'logo.svg');
const iconsPath: string = path.resolve(
  __dirname,
  '..',
  'src',
  'extensionIcons'
);
const targetSizes: number[] = [16, 32, 48, 128];

// Build extension icons.
fs.ensureDir(iconsPath).then(generateIcons);

/**
 * Generate extension icons.
 *
 * @since 1.4.0
 */
function generateIcons(): void {
  targetSizes.forEach((size: number) => {
    sharp(svgPath)
      .png()
      .resize({ width: size, height: size })
      .toFile(`${iconsPath}/icon-${size}.png`);
  });
}
