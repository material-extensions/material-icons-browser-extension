/**
 * External depedencies
 */
const path = require('path');
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const Parcel = require('parcel-bundler');
const extractSVGs = require('./extract-svgHtml');

/**
 * Internal depedencies
 */
const srcPath = path.resolve(__dirname, '..', 'src');
const distPath = path.resolve(__dirname, '..', 'dist');
const destSVGPath = path.resolve(__dirname, '..', 'optimizedSVGs');

// copy src files to dist.
mkdirp(distPath).then(createIconsCache).then(copySrc);

/**
 * Copy the src files.
 *
 * @since 1.4.0
 *
 * @returns a newly generated promise object.
 */
function copySrc() {
  // Copy manifest file.
  const copyManifest = fs.copy(
    path.resolve(srcPath, 'manifest.json'),
    path.resolve(distPath, 'manifest.json')
  );

  // Copy extension icon.
  const copyExtensionLogos = fs.copy(
    path.resolve(srcPath, 'extensionIcons'),
    path.resolve(distPath, 'icons')
  );

  // Bundle the main script.
  const entryFile = path.resolve(srcPath, 'main.js');
  const bundleMainScript = new Parcel(entryFile, {
    watch: false,
    minify: true,
  }).bundle();

  return Promise.all([copyManifest, copyExtensionLogos, bundleMainScript]);
}

/**
 * Create icons cache.
 *
 * @since 1.4.0
 */
function createIconsCache() {
  return new Promise((resolve, reject) => {
    fs.copy(path.resolve(srcPath, 'customIcons'), destSVGPath)
      .then(() => extractSVGs())
      .then(resolve)
      .catch(reject);
  });
}
