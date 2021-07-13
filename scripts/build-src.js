const path = require('path');
const fs = require('fs-extra');
const mkdirp = require('make-dir');
const Parcel = require('@parcel/core').default;
const extractSvgHtml = require('./extract-svg-html');
const destSVGPath = path.resolve(__dirname, '..', 'svg');
const distPath = path.resolve(__dirname, '..', 'dist');
const srcPath = path.resolve(__dirname, '..', 'src');

// Copy src files to dist.
mkdirp(distPath).then(createIconsCache).then(src);

/**
 * Create icons cache.
 *
 * @since 1.0.0
 */
function createIconsCache() {
  console.log('[1/2] Generate icon cache for extension.');
  return new Promise((resolve, reject) => {
    fs.copy(path.resolve(srcPath, 'custom'), destSVGPath)
      .then(() => extractSvgHtml({ task: '1' }))
      .then(resolve)
      .catch(reject);
  });
}

/**
 * Copy the src files.
 *
 * @since 1.0.0
 *
 * @returns {Promise} a newly generated promise object.
 */
function src() {
  console.log('[2/2] Bundle extension manifest, images and main script.');

  const parcelOptions = {
    entries: path.resolve(srcPath, 'main.js'),
    mode: 'development',
    defaultTargetOptions: {
      engines: {
        browsers: ['last 1 Chrome version'],
        node: '12'
      }
    }
  };
  const bundler = new Parcel(parcelOptions);
  const bundleMainScript = bundler.run();

  const copyManifest = fs.copy(
    path.resolve(srcPath, 'manifest.json'),
    path.resolve(distPath, 'manifest.json')
  );

  const copyExtensionLogos = fs.copy(path.resolve(srcPath, 'icons'), distPath);

  return Promise.all([copyManifest, copyExtensionLogos, bundleMainScript]);
}
