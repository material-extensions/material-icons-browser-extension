/**
 * Copies version from package.json into src/manifest.json
 */

const path = require('path');
const fs = require('fs').promises;

const package = require(path.resolve(__dirname, '..', 'package.json'));

const manifestPath = path.resolve(__dirname, '..', 'src', 'manifests', 'base.json');
const manifest = require(manifestPath);

const updatedManifest = { ...manifest, version: package.version };
const updatedManifestStr = `${JSON.stringify(updatedManifest, null, 2)}\n`;

fs.writeFile(manifestPath, updatedManifestStr)
  .then(() => {
    console.log(`Updated manifest.json version to ${package.version}`);
  })
  .catch(console.error);
