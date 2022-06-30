const fetch = require('node-fetch');
const path = require('path');
const api = require('@octokit/core');
const compareVersions = require('compare-versions');
const fs = require('fs/promises');

const upstreamVersionFilePath = path.resolve(__dirname, '..', 'upstream.version');
const upstreamCommitFilePath = path.resolve(__dirname, '..', 'upstream.commit');

/**
 * Gets latest VSCode Extension release version by parsing it's most recent 100 commit msgs
 *
 * returns version string or undefined
 *
 * @returns {Promise<string>} The current version of the upstream repository.
 */
const getUpstreamVersion = () =>
  fetch('https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/package.json')
    .then((res) => res.json())
    .then((package) => package.version);

const octokit = new api.Octokit();
const getUpstreamCommit = () =>
  octokit
    .request('GET /repos/PKief/vscode-material-icon-theme/commits', { per_page: 1 })
    .then((res) => res.data?.[0].sha);

const getLastUpstreamVersion = () =>
  fs.readFile(upstreamVersionFilePath, { encoding: 'utf8' }).then((data) => data.trim());

const updateReadmeBadge = async (version) => {
  const readmeFilePath = path.resolve(__dirname, '..', 'README.md');

  const readme = await fs.readFile(readmeFilePath, { encoding: 'utf8' });

  const versionRgx = /(badge\/[\w_]+-v)\d+\.\d+\.\d+/;
  const replacement = `$1${version}`;

  const updatedReadme = readme.replace(versionRgx, replacement);

  return fs.writeFile(readmeFilePath, updatedReadme);
};

const run = async () => {
  const latestVersion = await getUpstreamVersion();
  const lastSeenVersion = await getLastUpstreamVersion();
  const latestUpstreamCommit = await getUpstreamCommit();

  console.log(`Latest upstream version: ${latestVersion}`);
  console.log(`Current repository version: ${lastSeenVersion}`);

  if (!latestVersion || compareVersions.compare(lastSeenVersion, latestVersion, '>=')) {
    // exit script with an error. Simplifies chaining of shell commands only in case updates are found
    console.log('No update necessary.');
    process.exit(1);
  }

  console.log('Updating upstream version in "/upstream.version"');
  await fs.writeFile(upstreamVersionFilePath, latestVersion);

  console.log('Updating upstream commit sha in "/upstream.commit"');
  await fs.writeFile(upstreamCommitFilePath, latestUpstreamCommit);

  console.log('Updating upstream version badge in README');
  await updateReadmeBadge(latestVersion);
};

run();
