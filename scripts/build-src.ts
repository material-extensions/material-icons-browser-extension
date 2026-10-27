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

const startupStyleFiles = [
  path.resolve(srcDir, 'styles', 'startup', 'providers', 'forgejo.css'),
];

const runtimeStyleFiles = [
  path.resolve(srcDir, 'styles', 'runtime', 'base.css'),
  path.resolve(srcDir, 'styles', 'runtime', 'icon-size.css'),
  path.resolve(srcDir, 'styles', 'runtime', 'providers', 'github.css'),
];

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

async function bundleCss(files: string[], outFile: string): Promise<void> {
  const contents = await Promise.all(files.map((file) => fs.readFile(file)));
  await fs.outputFile(outFile, contents.join('\n'));
}

async function bundleInjectedStyles(outDir: string): Promise<void> {
  await Promise.all([
    bundleCss(startupStyleFiles, path.resolve(outDir, 'injected-startup.css')),
    bundleCss(runtimeStyleFiles, path.resolve(outDir, 'injected-styles.css')),
  ]);
}

/**
 * Build the extension for a specific browser target.
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
    bundle(outDir, path.resolve(srcDir, 'background.ts')),
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
      path.resolve(srcDir, 'ui', 'shared', 'appearance-controls.css'),
      path.resolve(outDir, 'appearance-controls.css')
    ),
    bundleInjectedStyles(outDir),
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

  const targets = [
    {
      displayName: 'Firefox',
      outputDir: 'firefox',
      manifestFile: 'firefox.json',
    },
    {
      displayName: 'Chrome/Edge',
      outputDir: 'chrome-edge',
      manifestFile: 'chrome-edge.json',
    },
    { displayName: 'Safari', outputDir: 'safari', manifestFile: 'safari.json' },
  ];

  for (const target of targets) {
    console.log(`Building ${target.displayName} target...`);
    await buildBrowserTarget(target.outputDir, target.manifestFile);
  }

  console.log('Build complete.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
