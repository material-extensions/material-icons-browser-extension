const git = require('simple-git')();
const child_process = require('child_process');
const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const rimraf = require('rimraf');

const distPath = path.resolve(__dirname, '..', 'dist');
const vsExtPath = path.resolve(__dirname, '..', 'temp');
const srcPath = path.resolve(__dirname, '..', 'src');

rimraf.sync(distPath);
mkdirp(distPath).then(() => Promise.all([src(), dependencies()]));

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
  return Promise.all([copyCustomIcons, copyMainScript, copyManifest]);
}

// Copy dependencies from vs code extension

function dependencies() {
  return git
    .clone(`https://github.com/PKief/vscode-material-icon-theme.git`, 'temp')
    .then(npmInstallExt)
    .then(() => fs.copy(path.resolve(vsExtPath, 'icons'), path.resolve(distPath, 'icons')))
    .then(optimizeSVGs)
    .then(npmBuildExt)
    .then(() =>
      fs.copy(
        path.resolve(vsExtPath, 'dist', 'material-icons.json'),
        path.resolve(distPath, 'iconMap.json')
      )
    )
    .then(() => rimraf.sync(vsExtPath))
    .then(resolve)
    .catch(reject);
}

////

const vsExtExecOptions = {
  cwd: vsExtPath,
  stdio: 'inherit',
};

function npmInstallExt() {
  child_process.execSync(`npm install`, vsExtExecOptions);
}

function npmBuildExt() {
  child_process.execSync(`npm run build`, vsExtExecOptions);
}

const distIconsExecOptions = { cwd: path.resolve(distPath, 'icons'), stdio: 'inherit' };

function optimizeSVGs() {
  child_process.exec(`npx svgo --disable=removeViewBox .`, distIconsExecOptions);
}
