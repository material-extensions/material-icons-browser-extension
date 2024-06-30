import * as path from 'path';
import * as fs from 'fs/promises';

const packageJsonPath: string = path.resolve(__dirname, '..', 'package.json');
const manifestPath: string = path.resolve(
  __dirname,
  '..',
  'src',
  'manifests',
  'base.json'
);

const updateManifestVersion = async (): Promise<void> => {
  const packageJsonData: string = await fs.readFile(packageJsonPath, {
    encoding: 'utf8',
  });
  const packageJson = JSON.parse(packageJsonData);

  const manifestData: string = await fs.readFile(manifestPath, {
    encoding: 'utf8',
  });
  const manifest = JSON.parse(manifestData);

  const updatedManifest = {
    ...manifest,
    version: packageJson.version,
  };
  const updatedManifestStr: string = `${JSON.stringify(updatedManifest, null, 2)}\n`;

  await fs.writeFile(manifestPath, updatedManifestStr);
  console.log(`Updated manifest.json version to ${packageJson.version}`);
};

updateManifestVersion().catch(console.error);
