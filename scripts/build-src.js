/**
 * External depedencies
 */
const path = require('path');
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const Parcel = require('parcel-bundler');

/**
 * Internal depedencies
 */
const srcPath = path.resolve(__dirname, '..', 'src');
const distPath = path.resolve(__dirname, '..', 'dist');
const destSVGPath = path.resolve(__dirname, '..', 'optimizedSVGs');
const extractSVGs = require('./extract-svgHtml');

// Copy src files to dist.
mkdirp(distPath).then(createIconsCache).then(src);

/**
 * Copy the src files.
 *
 * @since 1.0.0
 *
 * @returns {Promise} a newly generated promise object.
 */
function src() {
  const entryFile = path.resolve(srcPath, 'main.js');
  const parcelOptions = {
    watch: false,
    minify: true,
  };
  const bundler = new Parcel(entryFile, parcelOptions);
  const bundleMainScript = bundler.bundle();

  const copyManifest = fs.copy(
    path.resolve(srcPath, 'manifest.json'),
    path.resolve(distPath, 'manifest.json')
  );

  const copyExtensionLogos = fs.copy(path.resolve(srcPath, 'extensionIcons'), distPath);

  return Promise.all([copyManifest, copyExtensionLogos, bundleMainScript]);
}

/**
 * Create icons cache.
 *
 * @since 1.0.0
 */
function createIconsCache() {
  return new Promise((resolve, reject) => {
    fs.copy(path.resolve(srcPath, 'customIcons'), destSVGPath)
      .then(() => extractSVGs())
      .then(resolve)
      .catch(reject);
  });
}
