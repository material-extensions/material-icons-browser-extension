// DEPENDS ON INKSCAPE 1.x on the PATH

// renders src/logo.svg to desired icon sizes for the extension
const child_process = require('child_process');
const mkdirp = require('make-dir');
const path = require('path');

const extIconsPath = path.resolve(__dirname, '..', 'src', 'icons');
const srcPath = path.resolve(__dirname, '..', 'src');
const svgPath = path.resolve(srcPath, 'logo.svg');
const targetSizes = [16, 32, 48, 128];

const execOptions = {
  cwd: extIconsPath,
  stdio: 'inherit',
};

// ensure inkscape 1.x is available
child_process.exec('inkscape --version', execOptions, (error, stout) => {
  if (error)
    console.error(
      `inkscape doesn't seem to be available. Make sure you have inkscape 1.0.1 or later installed on the PATH`
    );
  else {
    // check version
    const versionRgx = /Inkscape (?<major>\d+).\d+.\d+/;
    const major = versionRgx.exec(stout)?.groups?.major;
    if (!major || +major < 1)
      console.error(
        `inkscape version is not compatible with this script. Make sure to install v1.x or later.`
      );

    buildIcons();
  }
});
// build icons
function buildIcons() {
  mkdirp(extIconsPath).then(Promise.all(targetSizes.map((size) => generateImage(svgPath, size))));
}

function generateImage(svgPath, size) {
  return new Promise((resolve, reject) => {
    child_process.exec(
      `inkscape -h ${size} -w ${size} -o icon${size}.png ${svgPath}`,
      execOptions,
      (err, stout) => {
        if (err) reject(err);
        else resolve(stout);
      }
    );
  });
}
