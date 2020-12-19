const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');

const distPath = path.resolve(__dirname, '..', 'dist');
const srcPath = path.resolve(__dirname, '..', 'src');

mkdirp(distPath).then(src);

// copy src files

function src() {
  const copyCustomIcons = fs.copy(
    path.resolve(srcPath, 'customIcons'),
    path.resolve(distPath, 'icons')
  );
  const copyMainScript = fs.copy(
    path.resolve(srcPath, 'main.js'),
    path.resolve(distPath, 'main.js')
  );
  const copyManifest = fs.copy(
    path.resolve(srcPath, 'manifest.json'),
    path.resolve(distPath, 'manifest.json')
  );
  const copyExtensionLogos = fs.copy(path.resolve(srcPath, 'extensionIcons'), distPath);
  return Promise.all([copyCustomIcons, copyMainScript, copyManifest, copyExtensionLogos]);
}
