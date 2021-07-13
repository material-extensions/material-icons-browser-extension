/**
 * External depedencies
 */
const path = require('path');
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const simpleGit = require('simple-git');
const git = simpleGit();
const child_process = require('child_process');

/**
 * Internal depedencies
 */
const srcPath = path.resolve(__dirname, '..', 'src');
const vsExtPath = path.resolve(__dirname, '..', 'temp');
const destSVGPath = path.resolve(__dirname, '..', 'svg');
const vsExtExecOptions = {
  cwd: vsExtPath,
  stdio: 'inherit',
};
const distIconsExecOptions = {
  cwd: path.resolve(destSVGPath),
  stdio: 'inherit',
};

// Copy dependencies from vs code extension.
rimraf.sync(vsExtPath);
rimraf.sync(destSVGPath);
mkdirp(destSVGPath)
  .then(() => {
    console.log('[1/7] Cloning PKief/vscode-material-icon-theme into temporary cache.');
    return git.clone(`https://github.com/PKief/vscode-material-icon-theme.git`, 'temp', [
      '--depth',
      '1',
    ]);
  })
  .then(() => {
    console.log('[2/7] Terminate Git repository in temporary cache.');
    return rimraf.sync(path.resolve(vsExtPath, '.git'));
  })
  .then(() => {
    console.log('[3/7] Install NPM dependencies for VSC extension.');
    child_process.execSync(`npm install --ignore-scripts`, vsExtExecOptions);
  })
  .then(() => {
    console.log('[4/7] Terminate Git tracking in temporary cache.');
    return fs.copy(path.resolve(vsExtPath, 'icons'), path.resolve(destSVGPath));
  })
  .then(() => {
    console.log('[5/7] Optimise extension icons using SVGO.');
    child_process.exec(`npx svgo -r .`, distIconsExecOptions);
  })
  .then(() => {
    console.log('[6/7] Run build tasks for VSC extension.');
    child_process.execSync(`npm run build`, vsExtExecOptions);
  })
  .then(() => {
    console.log('[7/7] Copy file icon configuration to source code directory.');
    return fs.copy(
      path.resolve(vsExtPath, 'dist', 'material-icons.json'),
      path.resolve(srcPath, 'icon-map.json')
    );
  })
  .then(() => rimraf.sync(vsExtPath));
