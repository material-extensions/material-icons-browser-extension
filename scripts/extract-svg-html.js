const path = require('path');
const fs = require('fs').promises;
const { parse } = require('node-html-parser');

module.exports = function extract(opts) {
  console.log(`[${opts.task}:1/4] Initialise SVG extraction process.`);
  const iconsPath = path.resolve(__dirname, '..', 'svg');
  const destCachePath = path.resolve(__dirname, '..', 'src', 'icon-cache.js');

  return new Promise((resolve, reject) => {
    fs.readdir(iconsPath)
      .then((icons) => {
        console.log(`[${opts.task}:2/4] Fetch map of icon file names and SVG data.`);
        return Promise.all(
          icons.map((name) => fs.readFile(path.resolve(iconsPath, name), { encoding: 'utf8' }))
        ).then((xmlContent) => xmlContent.map((xml, i) => [icons[i], parse(xml)]))
      })
      .then((svgEntries) => {
        console.log(`[${opts.task}:3/4] Determine HTML code and viewbox for icon cache.`);
        return svgEntries.map((entry) => [
          entry[0],
          {
            innerHtml: entry[1].firstChild.innerHTML,
            viewBox: entry[1].firstChild.getAttribute('viewBox'),
          },
        ])
      })
      .then((cacheEntries) => Object.fromEntries(cacheEntries))
      .then((svgCacheObj) => {
        console.log(`[${opts.task}:4/4] Serialise icon map to JS cache module.`);
        return fs.writeFile(destCachePath, formatCache(svgCacheObj));
      })
      .then(resolve)
      .catch(reject);
  });
};

function formatCache(obj) {
  const declaration = `const cache = `;
  const cacheObj = JSON.stringify(obj);
  const bottomExport = `export default cache;`;

  const fileContents = `${declaration}${cacheObj}\n\n${bottomExport}`;

  return fileContents;
}
