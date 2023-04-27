/**
 * External depedencies
 */
const path = require('path');
const fs = require('fs-extra');
const simpleGit = require('simple-git');
const { execSync } = require('child_process');

/**
 * Internal depedencies
 */
const srcPath = path.resolve(__dirname, '..', 'src');
const vsExtPath = path.resolve(__dirname, '..', 'temp');
const destSVGPath = path.resolve(__dirname, '..', 'svg');
const commitLockPath = path.resolve(__dirname, '..', 'upstream.commit');

const vsExtExecOptions = {
  cwd: vsExtPath,
  stdio: 'inherit',
};
const distIconsExecOptions = {
  cwd: path.resolve(destSVGPath),
  stdio: 'inherit',
};

async function main() {
  await fs.remove(vsExtPath);
  await fs.remove(destSVGPath);
  await fs.ensureDir(destSVGPath);

  console.log('[1/7] Cloning PKief/vscode-material-icon-theme into temporary cache.');
  const git = simpleGit();
  await git.clone(`https://github.com/PKief/vscode-material-icon-theme.git`, vsExtPath, [
    '--depth',
    '100', // fetch only last 100 commits. Guesswork, could be too shallow if upstream doesnt release often
  ]);

  const commit = fs.readFileSync(commitLockPath, { encoding: 'utf8' })?.trim();
  console.log('Checking out to upstream commit:', commit);
  const upstreamGit = simpleGit(vsExtPath);
  await upstreamGit.checkout(commit, ['--force']);

  console.log('[2/7] Terminate Git repository in temporary cache.');
  await fs.remove(path.resolve(vsExtPath, '.git'));

  console.log('[3/7] Install NPM dependencies for VSC extension.');
  execSync(`npm install --ignore-scripts`, vsExtExecOptions);

  console.log('[4/7] Terminate Git tracking in temporary cache.');
  await fs.copy(path.resolve(vsExtPath, 'icons'), path.resolve(destSVGPath));

  console.log('[5/7] Optimise extension icons using SVGO.');
  execSync(`npx svgo -r .`, distIconsExecOptions);

  console.log('[6/7] Run build tasks for VSC extension.');
  execSync(`npm run build`, vsExtExecOptions);

  console.log('[7/7] Copy file icon configuration to source code directory.');
  await fs.copy(
    path.resolve(vsExtPath, 'dist', 'material-icons.json'),
    path.resolve(srcPath, 'icon-map.json')
  );

  await fs.remove(vsExtPath);
}

main();
