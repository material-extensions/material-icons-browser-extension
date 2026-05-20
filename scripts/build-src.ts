import * as esbuild from 'esbuild';
import * as fs from 'fs-extra';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const srcDir = path.resolve(root, 'src');
const distDir = path.resolve(root, 'dist');
const upstreamIconsDir = path.resolve(
  root,
  'node_modules',
  'material-icon-theme',
  'icons'
);
const customIconsDir = path.resolve(srcDir, 'custom');

/**
 * Merge upstream icons with custom overrides and generate the icon lookup map.
 * The lookup map maps icon names (without extension) to their filenames.
 */
async function generateIconList(): Promise<void> {
  // Copy custom icons into upstream icons dir (overrides any conflicts)
  await fs.copy(customIconsDir, upstreamIconsDir);

  const files = await fs.readdir(upstreamIconsDir);
  const iconMap = Object.fromEntries(
    files.map((file) => [file.replace('.clone', '').replace('.svg', ''), file])
  );

  await fs.writeJSON(path.resolve(srcDir, 'icon-list.json'), iconMap);
}

/**
 * Bundle a TypeScript/TSX entry point with esbuild.
 */
function bundle(
  outDir: string,
  entryPoint: string
): Promise<esbuild.BuildResult> {
  return esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    minify: true,
    sourcemap: false,
    outdir: outDir,
    loader: { '.svg': 'dataurl' },
  });
}

/**
 * Build the extension for a specific browser target (firefox / chrome-edge).
 * Copies icons, bundles JS, copies static assets, and assembles the manifest.
 */
async function buildBrowserTarget(
  targetName: string,
  manifestFile: string
): Promise<void> {
  const outDir = path.resolve(distDir, targetName);
  await fs.ensureDir(outDir);

  // Run all independent operations in parallel
  await Promise.all([
    // Icons
    fs.copy(upstreamIconsDir, outDir),

    // JS bundles
    bundle(outDir, path.resolve(srcDir, 'main.ts')),
    bundle(outDir, path.resolve(srcDir, 'ui', 'popup', 'settings-popup.tsx')),
    bundle(outDir, path.resolve(srcDir, 'ui', 'options', 'options.tsx')),

    // Static files
    fs.copy(
      path.resolve(srcDir, 'ui', 'popup', 'settings-popup.html'),
      path.resolve(outDir, 'settings-popup.html')
    ),
    fs.copy(
      path.resolve(srcDir, 'ui', 'popup', 'settings-popup.css'),
      path.resolve(outDir, 'settings-popup.css')
    ),
    fs.copy(
      path.resolve(srcDir, 'ui', 'options', 'options.html'),
      path.resolve(outDir, 'options.html')
    ),
    fs.copy(
      path.resolve(srcDir, 'ui', 'options', 'options.css'),
      path.resolve(outDir, 'options.css')
    ),
    fs.copy(
      path.resolve(srcDir, 'injected-styles.css'),
      path.resolve(outDir, 'injected-styles.css')
    ),
    fs.copy(path.resolve(srcDir, 'extensionIcons'), outDir),
  ]);

  // Assemble browser-specific manifest
  const [baseManifest, browserManifest] = await Promise.all([
    fs.readJson(path.resolve(srcDir, 'manifests', 'base.json')),
    fs.readJson(path.resolve(srcDir, 'manifests', manifestFile)),
  ]);
  await fs.writeJson(
    path.resolve(outDir, 'manifest.json'),
    { ...baseManifest, ...browserManifest },
    { spaces: 2 }
  );
}

async function main(): Promise<void> {
  console.log('Generating icon list...');
  await generateIconList();

  console.log('Building Firefox target...');
  await buildBrowserTarget('firefox', 'firefox.json');

  console.log('Building Chrome/Edge target...');
  await buildBrowserTarget('chrome-edge', 'chrome-edge.json');

  console.log('Build complete.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
