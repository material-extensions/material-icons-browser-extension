const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const Parcel = require('parcel-bundler');
const extractSVGs = require('./extract-svgHtml');

const destSVGPath = path.resolve(__dirname, '..', 'optimizedSVGs');
const distPath = path.resolve(__dirname, '..', 'dist');
const srcPath = path.resolve(__dirname, '..', 'src');

mkdirp(distPath).then(createIconsCache).then(src);

// copy src files

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

function createIconsCache() {
  return new Promise((resolve, reject) => {
    fs.copy(path.resolve(srcPath, 'customIcons'), destSVGPath)
      .then(() => extractSVGs())
      .then(resolve)
      .catch(reject);
  });
}
