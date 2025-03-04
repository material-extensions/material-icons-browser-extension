import 'dotenv/config';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Gets latest version of the Material Icon Theme Module
 *
 * @returns {Promise<string>} The current version of the upstream repository.
 */
const getUpstreamVersion = async (): Promise<string> => {
  const packagePath: string = path.resolve(
    __dirname,
    '..',
    'node_modules',
    'material-icon-theme',
    'package.json'
  );
  const packageData: string = await fs.readFile(packagePath, {
    encoding: 'utf8',
  });
  const packageJson = JSON.parse(packageData) as { version: string };
  return packageJson.version;
};

/**
 * Updates the version badge in the README file.
 *
 * @param {string} version - The new version to update the badge to.
 * @returns {Promise<void>}
 */
const updateReadmeBadge = async (version: string): Promise<void> => {
  const readmeFilePath: string = path.resolve(__dirname, '..', 'README.md');
  const readme: string = await fs.readFile(readmeFilePath, {
    encoding: 'utf8',
  });
  const versionRgx: RegExp = /(badge\/[\w_]+-v)\d+\.\d+\.\d+/;
  const replacement: string = `$1${version}`;
  const updatedReadme: string = readme.replace(versionRgx, replacement);

  await fs.writeFile(readmeFilePath, updatedReadme);
};

/**
 * Main function to run the update process.
 */
const run = async (): Promise<void> => {
  const latestVersion: string = await getUpstreamVersion();
  await updateReadmeBadge(latestVersion);
};

run().catch(console.error);
