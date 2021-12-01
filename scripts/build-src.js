const path = require('path');
const fs = require('fs-extra');
const Parcel = require('parcel-bundler');
const destSVGPath = path.resolve(__dirname, '..', 'svg');
const distPath = path.resolve(__dirname, '..', 'dist');
const srcPath = path.resolve(__dirname, '..', 'src');

// Copy src files to dist.
fs.ensureDir(distPath).then(consolidateSVGFiles).then(src).catch(console.error);

/** Create icons cache. */
function consolidateSVGFiles() {
  console.log('[1/2] Generate icon cache for extension.');
  return fs
    .copy(path.resolve(srcPath, 'custom'), destSVGPath)
    .then(() => fs.readdir(destSVGPath))
    .then((files) => Object.fromEntries(files.map((filename) => [filename, filename])))
    .then((iconsDict) => fs.writeJSON(path.resolve(srcPath, 'icon-list.json'), iconsDict));
}

/**
 * Copy the src files.
 *
 * @returns {Promise} a newly generated promise object.
 */
function src() {
  console.log('[2/2] Bundle extension manifest, images and main script.');

  const entryFile = path.resolve(srcPath, 'main.js');
  const parcelOptions = {
    watch: false,
    minify: true,
    sourceMaps: false,
  };
  const bundler = new Parcel(entryFile, parcelOptions);
  const bundleMainScript = bundler.bundle();

  const copyIcons = fs.copy(destSVGPath, distPath);

  const copyManifest = fs.copy(
    path.resolve(srcPath, 'manifest.json'),
    path.resolve(distPath, 'manifest.json')
  );

  const copyExtensionLogos = fs.copy(path.resolve(srcPath, 'icons'), distPath);

  return Promise.all([copyManifest, copyExtensionLogos, bundleMainScript, copyIcons]);
}
