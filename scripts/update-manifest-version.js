/**
 * Copies version from package.json into src/manifest.json
 */

const path = require('path');
const fs = require('fs').promises;

const package = require(path.resolve(__dirname, '..', 'package.json'));

const manifestPath = path.resolve(__dirname, '..', 'src', 'manifest.json');
const manifest = require(manifestPath);

const updatedManifest = { ...manifest, version: package.version };
const updatedManifestStr = JSON.stringify(updatedManifest, null, 2) + '\n';

fs.writeFile(manifestPath, updatedManifestStr);
