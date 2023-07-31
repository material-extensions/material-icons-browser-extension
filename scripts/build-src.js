const path = require('path');
const fs = require('fs-extra');
const Parcel = require('parcel-bundler');

const destSVGPath = path.resolve(__dirname, '..', 'svg');
const distBasePath = path.resolve(__dirname, '..', 'dist');
const srcPath = path.resolve(__dirname, '..', 'src');

/** Create icons cache. */
async function consolidateSVGFiles() {
  console.log('[1/2] Generate icon cache for extension.');
  await fs
    .copy(path.resolve(srcPath, 'custom'), destSVGPath)
    .then(() => fs.readdir(destSVGPath))
    .then((files) => Object.fromEntries(files.map((filename) => [filename, filename])))
    .then((iconsDict) => fs.writeJSON(path.resolve(srcPath, 'icon-list.json'), iconsDict));
}

function bundleJS(outDir, entryFile) {
  const parcelOptions = {
    watch: false,
    minify: true,
    sourceMaps: false,
    outDir,
  };
  const bundler = new Parcel(entryFile, parcelOptions);
  return bundler.bundle();
}

function src(distPath) {
  console.log('[2/2] Bundle extension manifest, images and main script.');

  const copyIcons = fs.copy(destSVGPath, distPath);

  const bundleMainScript = () => bundleJS(distPath, path.resolve(srcPath, 'main.js'));
  const bundlePopupScript = () =>
    bundleJS(distPath, path.resolve(srcPath, 'ui', 'popup', 'settings-popup.js'));
  const bundleOptionsScript = () =>
    bundleJS(distPath, path.resolve(srcPath, 'ui', 'options', 'options.js'));
  const bundleAll = bundleMainScript().then(bundlePopupScript).then(bundleOptionsScript);

  const copyPopup = Promise.all(
    ['settings-popup.html', 'settings-popup.css', 'settings-popup.github-logo.svg'].map((file) =>
      fs.copy(path.resolve(srcPath, 'ui', 'popup', file), path.resolve(distPath, file))
    )
  );

  const copyOptions = Promise.all(
    ['options.html', 'options.css'].map((file) =>
      fs.copy(path.resolve(srcPath, 'ui', 'options', file), path.resolve(distPath, file))
    )
  );

  const copyStyles = fs.copy(
    path.resolve(srcPath, 'injected-styles.css'),
    path.resolve(distPath, 'injected-styles.css')
  );

  const copyExtensionLogos = fs.copy(path.resolve(srcPath, 'extensionIcons'), distPath);

  return Promise.all([
    copyExtensionLogos,
    copyOptions,
    copyPopup,
    copyStyles,
    copyIcons,
    bundleAll,
  ]);
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

  return fs
    .ensureDir(distPath)
    .then(consolidateSVGFiles)
    .then(() => src(distPath))
    .then(() => buildManifest(distPath, manifestName))
    .catch(console.error);
}

buildDist('firefox', 'firefox.json').then(() => buildDist('chrome-edge', 'chrome-edge.json'));
