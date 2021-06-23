/**
 * External depedencies
 */
const path = require('path');
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const git = require('simple-git')();
const child_process = require('child_process');

/**
 * Internal depedencies
 */
const srcPath = path.resolve(__dirname, '..', 'src');
const vsExtPath = path.resolve(__dirname, '..', 'temp');
const destSVGPath = path.resolve(__dirname, '..', 'optimizedSVGs');
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
  .then(() =>
    git.clone(`https://github.com/PKief/vscode-material-icon-theme.git`, 'temp', ['--depth', '1'])
  )
  .then(() => child_process.execSync(`npm install --ignore-scripts`, vsExtExecOptions))
  .then(() => fs.copy(path.resolve(vsExtPath, 'icons'), path.resolve(destSVGPath)))
  .then(() => child_process.exec(`npx svgo -r .`, distIconsExecOptions))
  .then(() => child_process.execSync(`npm run build`, vsExtExecOptions))
  .then(() =>
    fs.copy(
      path.resolve(vsExtPath, 'dist', 'material-icons.json'),
      path.resolve(srcPath, 'iconMap.json')
    )
  )
  .then(() => rimraf.sync(vsExtPath));
