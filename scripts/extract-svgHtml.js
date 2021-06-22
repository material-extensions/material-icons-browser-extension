/**
 * External depedencies
 */
const path = require('path');
const fs = require('fs').promises;
const { parse } = require('node-html-parser');

/**
 * Retrieve the SVG elements.
 *
 * @since 1.0.0
 *
 * @returns a newly generated promise object.
 */
module.exports = function extractSVGs() {
  const iconsPath = path.resolve(__dirname, '..', 'optimizedSVGs');
  const destCachePath = path.resolve(__dirname, '..', 'src', 'iconsCache.js');

  return new Promise((resolve, reject) => {
    fs.readdir(iconsPath)
      .then((iconsNames) =>
        Promise.all(
          iconsNames.map((name) => fs.readFile(path.resolve(iconsPath, name), { encoding: 'utf8' }))
        ).then((svgStrs) => svgStrs.map((svgStr, i) => [iconsNames[i], parse(svgStr)]))
      )
      .then((svgElsEntries) =>
        svgElsEntries.map((entry) => [
          entry[0],
          {
            innerHtml: entry[1].firstChild.innerHTML,
            viewBox: entry[1].firstChild.getAttribute('viewBox'),
          },
        ])
      )
      .then((cacheEntries) => Object.fromEntries(cacheEntries))
      .then((svgsObj) => fs.writeFile(destCachePath, formatCache(svgsObj)))
      .then(resolve)
      .catch(reject);
  });
};

/**
 * Format icons cache.
 *
 * @since 1.0.0
 *
 * @param {*} obj SVG Object.
 * @returns Cache file contents.
 */
function formatCache(obj) {
  const declaration = `const cache = `;
  const cacheObj = JSON.stringify(obj);
  const bottomExport = `export default cache;`;

  const fileContents = `${declaration}${cacheObj}\n\n${bottomExport}`;

  return fileContents;
}
