const git = require('simple-git')();
const child_process = require('child_process');
const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const rimraf = require('rimraf');

const destSVGPath = path.resolve(__dirname, '..', 'optimizedSVGs');
const vsExtPath = path.resolve(__dirname, '..', 'temp');
const srcPath = path.resolve(__dirname, '..', 'src');

// Copy dependencies from vs code extension

rimraf.sync(vsExtPath);
rimraf.sync(destSVGPath);
mkdirp(destSVGPath)
  .then(() => git.clone(`https://github.com/PKief/vscode-material-icon-theme.git`, 'temp'))
  .then(npmInstallExt)
  .then(() => fs.copy(path.resolve(vsExtPath, 'icons'), path.resolve(destSVGPath)))
  .then(optimizeSVGs)
  .then(npmBuildExt)
  .then(() =>
    fs.copy(
      path.resolve(vsExtPath, 'dist', 'material-icons.json'),
      path.resolve(srcPath, 'iconMap.json')
    )
  )
  .then(() => rimraf.sync(vsExtPath))
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

const distIconsExecOptions = { cwd: path.resolve(destSVGPath), stdio: 'inherit' };

function optimizeSVGs() {
  child_process.exec(`npx svgo --disable=removeViewBox .`, distIconsExecOptions);
}
