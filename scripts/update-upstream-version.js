const api = require('@octokit/core');
const path = require('path');
const compareVersions = require('compare-versions');
const fs = require('fs').promises;

const octokit = new api.Octokit();

const upstreamVersionFilePath = path.resolve(__dirname, '..', 'upstream.version');

/**
 * Gets latest VSCode Extension release version by parsing it's most recent 100 commit msgs
 *
 * returns version string or undefined
 */
const getUpstreamVersion = async () => {
  const response = await octokit.request(
    'GET https://api.github.com/repos/PKief/vscode-material-icon-theme/commits?per_page=100'
  );

  // extract array of commit msgs. These are sorted from latest to oldest
  const commitMsgs = response.data.map((commit) => commit.commit.message);

  const releaseMsgRgx = /^Release\s+(?<version>\d+\.\d+\.\d+)/;
  const releaseCommits = commitMsgs.filter((msg) => releaseMsgRgx.test(msg));

  const upstreamVersion = releaseMsgRgx.exec(releaseCommits[0])?.groups?.version;

  return upstreamVersion;
};

const getLastUpstreamVersion = () => fs.readFile(upstreamVersionFilePath, { encoding: 'utf8' });

const updateReadmeBadge = async (version) => {
  const readmeFilePath = path.resolve(__dirname, '..', 'README.md');

  const readme = await fs.readFile(readmeFilePath, { encoding: 'utf8' });

  const versionRgx = /(badge\/[\w_]+-v)\d+\.\d+\.\d+/
  const replacement = `$1${version}`

  const updatedReadme = readme.replace(versionRgx, replacement)

  return fs.writeFile(readmeFilePath, updatedReadme)
};

const run = async () => {
  const latestVersion = await getUpstreamVersion();
  const lastSeenVersion = await getLastUpstreamVersion();

  console.log(`Latest upstream version: ${latestVersion}`);
  console.log(`Current repository version: ${lastSeenVersion}`);

  if (!latestVersion || compareVersions.compare(lastSeenVersion, latestVersion, '>=')) {
    // exit script with an error. Simplifies chaining of shell commands only in case updates are found
    console.log('No update necessary.');
    process.exit(1);
  }

  console.log('Updating upstream version in "/upstream.version"');
  await fs.writeFile(upstreamVersionFilePath, latestVersion);

  console.log('Updating upstream version badge in README');
  await updateReadmeBadge(latestVersion);
};

run();
