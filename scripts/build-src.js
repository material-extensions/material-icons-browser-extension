const path = require('path');
const fs = require('fs-extra');
const Parcel = require('parcel-bundler');
const destSVGPath = path.resolve(__dirname, '..', 'svg');
const distBasePath = path.resolve(__dirname, '..', 'dist');
const srcPath = path.resolve(__dirname, '..', 'src');

/** Create icons cache. */
function consolidateSVGFiles() {
  console.log('[1/2] Generate icon cache for extension.');
  return fs
    .copy(path.resolve(srcPath, 'custom'), destSVGPath)
    .then(() => fs.readdir(destSVGPath))
    .then((files) => Object.fromEntries(files.map((filename) => [filename, filename])))
    .then((iconsDict) => fs.writeJSON(path.resolve(srcPath, 'icon-list.json'), iconsDict));
}

function src(distPath) {
  console.log('[2/2] Bundle extension manifest, images and main script.');

  const entryFile = path.resolve(srcPath, 'main.js');
  const parcelOptions = {
    watch: false,
    minify: true,
    sourceMaps: false,
    outDir: distPath,
  };
  const bundler = new Parcel(entryFile, parcelOptions);
  const bundleMainScript = bundler.bundle();

  const copyIcons = fs.copy(destSVGPath, distPath);

  const copyExtensionLogos = fs.copy(path.resolve(srcPath, 'icons'), distPath);

  return Promise.all([copyExtensionLogos, bundleMainScript, copyIcons]);
}

function buildManifest(distPath, manifestName) {
  return Promise.all([
    fs.readJson(path.resolve(srcPath, 'manifests', 'base.json')),
    fs.readJson(path.resolve(srcPath, 'manifests', manifestName)),
  ])
    .then(([base, custom]) => ({ ...base, ...custom }))
    .then((manifest) =>
      fs.writeJson(path.resolve(distPath, 'manifest.json'), manifest, { spaces: 2 })
    );
}

function buildDist(name, manifestName) {
  const distPath = path.resolve(distBasePath, name);

  return fs.ensureDir(distPath)
    .then(consolidateSVGFiles)
    .then(() => src(distPath))
    .then(() => buildManifest(distPath, manifestName))
    .catch(console.error);
}

buildDist('firefox', 'firefox.json').then(() => buildDist('chrome-edge', 'chrome-edge.json'));
