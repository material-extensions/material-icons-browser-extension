const simpleGit = require('simple-git');
const cp = require('child_process');
const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const rimraf = require('rimraf');

const git = simpleGit();

const destSVGPath = path.resolve(__dirname, '..', 'svg');
const vsExtPath = path.resolve(__dirname, '..', 'temp');
const srcPath = path.resolve(__dirname, '..', 'src');

// Copy dependencies from vs code extension

rimraf.sync(vsExtPath);
rimraf.sync(destSVGPath);
mkdirp(destSVGPath)
  .then(() => {
    console.log('[1/7] Cloning PKief/vscode-material-icon-theme into temporary cache.');
    return git.clone(`https://github.com/PKief/vscode-material-icon-theme.git`, 'temp');
  })
  .then(() => {
    console.log('[2/7] Terminate Git repository in temporary cache.');
    return rimraf.sync(path.resolve(vsExtPath, '.git'));
  })
  .then(npmInstallExt)
  .then(() => {
    console.log('[4/7] Terminate Git tracking in temporary cache.');
    return fs.copy(path.resolve(vsExtPath, 'icons'), path.resolve(destSVGPath))
  })
  .then(optimizeSVGs)
  .then(npmBuildExt)
  .then(() => {
    console.log('[7/7] Copy file icon configuration to source code directory.');
    return fs.copy(
      path.resolve(vsExtPath, 'dist', 'material-icons.json'),
      path.resolve(srcPath, 'icon-map.json')
    );
  }
  )
  .then(() => rimraf.sync(vsExtPath))
////

const vsExtExecOptions = {
  cwd: vsExtPath,
  stdio: 'inherit',
};

const distIconsExecOptions = {
  cwd: path.resolve(destSVGPath),
  stdio: 'inherit'
}

function npmInstallExt() {
  console.log('[3/7] Install NPM dependencies for VSC extension.');
  cp.execSync(`npm install`, vsExtExecOptions);
}

function optimizeSVGs() {
  console.log('[5/7] Optimise extension icons using SVGO.');
  cp.exec(`npx svgo --disable=removeViewBox .`, distIconsExecOptions);
}

function npmBuildExt() {
  console.log('[6/7] Run build tasks for VSC extension.');
  cp.execSync(`npm run build`, vsExtExecOptions);
}
