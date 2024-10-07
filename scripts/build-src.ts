import 'dotenv/config';
import * as path from 'path';
import * as esbuild from 'esbuild';
import * as fs from 'fs-extra';

const destSVGPath: string = path.resolve(
  __dirname,
  '..',
  'node_modules',
  'material-icon-theme',
  'icons'
);
const distBasePath: string = path.resolve(__dirname, '..', 'dist');
const srcPath: string = path.resolve(__dirname, '..', 'src');

/** Create icons cache. */
async function consolidateSVGFiles(): Promise<void> {
  console.log('[1/2] Generate icon cache for extension.');
  await fs
    .copy(path.resolve(srcPath, 'custom'), destSVGPath)
    .then(() => fs.readdir(destSVGPath))
    .then((files) =>
      Object.fromEntries(
        files.map((filename) => [
          // Remove '.clone' and '.svg' from filename
          filename
            .replace('.clone', '')
            .replace('.svg', ''),
          filename,
        ])
      )
    )
    .then((iconsDict) =>
      fs.writeJSON(path.resolve(srcPath, 'icon-list.json'), iconsDict)
    );
}

function bundleJS(
  outDir: string,
  entryFile: string
): Promise<esbuild.BuildResult> {
  const buildOptions: esbuild.BuildOptions = {
    entryPoints: [entryFile],
    bundle: true,
    minify: true,
    sourcemap: false,
    outdir: outDir,
  };
  return esbuild.build(buildOptions);
}

function src(
  distPath: string
): Promise<(void | esbuild.BuildResult | void[])[]> {
  console.log('[2/2] Bundle extension manifest, images and main script.');

  const copyIcons: Promise<void> = fs.copy(destSVGPath, distPath);

  const bundleMainScript = (): Promise<esbuild.BuildResult> =>
    bundleJS(distPath, path.resolve(srcPath, 'main.ts'));
  const bundlePopupScript = (): Promise<esbuild.BuildResult> =>
    bundleJS(
      distPath,
      path.resolve(srcPath, 'ui', 'popup', 'settings-popup.tsx')
    );
  const bundleOptionsScript = (): Promise<esbuild.BuildResult> =>
    bundleJS(distPath, path.resolve(srcPath, 'ui', 'options', 'options.tsx'));

  const bundleAll: Promise<esbuild.BuildResult> = bundleMainScript()
    .then(bundlePopupScript)
    .then(bundleOptionsScript);

  const copyPopup: Promise<void[]> = Promise.all(
    ['settings-popup.html', 'settings-popup.css'].map((file) =>
      fs.copy(
        path.resolve(srcPath, 'ui', 'popup', file),
        path.resolve(distPath, file)
      )
    )
  );

  const copyOptions: Promise<void[]> = Promise.all(
    ['options.html', 'options.css'].map((file) =>
      fs.copy(
        path.resolve(srcPath, 'ui', 'options', file),
        path.resolve(distPath, file)
      )
    )
  );

  const copyStyles: Promise<void> = fs.copy(
    path.resolve(srcPath, 'injected-styles.css'),
    path.resolve(distPath, 'injected-styles.css')
  );

  const copyExtensionLogos: Promise<void> = fs.copy(
    path.resolve(srcPath, 'extensionIcons'),
    distPath
  );

  return Promise.all([
    copyExtensionLogos,
    copyOptions,
    copyPopup,
    copyStyles,
    copyIcons,
    bundleAll,
  ]);
}

function buildManifest(distPath: string, manifestName: string): Promise<void> {
  return Promise.all([
    fs.readJson(path.resolve(srcPath, 'manifests', 'base.json')),
    fs.readJson(path.resolve(srcPath, 'manifests', manifestName)),
  ])
    .then(([base, custom]) => ({ ...base, ...custom }))
    .then((manifest) =>
      fs.writeJson(path.resolve(distPath, 'manifest.json'), manifest, {
        spaces: 2,
      })
    );
}

function buildDist(name: string, manifestName: string): Promise<void> {
  const distPath: string = path.resolve(distBasePath, name);

  return fs
    .ensureDir(distPath)
    .then(consolidateSVGFiles)
    .then(() => src(distPath))
    .then(() => buildManifest(distPath, manifestName))
    .catch(console.error);
}

buildDist('firefox', 'firefox.json').then(() =>
  buildDist('chrome-edge', 'chrome-edge.json')
);
