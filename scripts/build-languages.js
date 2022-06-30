const rimraf = require('rimraf');
const path = require('path');
const api = require('@octokit/core');
const fs = require('fs-extra');
const fr = require('follow-redirects');
const glob = require('glob');
const stringify = require('json-stable-stringify');
const remap = require('./remap.json');
const iconMap = require('../src/icon-map.json');

const vsDataPath = path.resolve(__dirname, '..', 'data');
const srcPath = path.resolve(__dirname, '..', 'src');

rimraf.sync(vsDataPath);
fs.ensureDirSync(vsDataPath);
rimraf.sync(path.resolve(srcPath, 'language-map.json'));

const resultsPerPage = 100; // max 100

let index = 0;
let total;
let items = [];
const languages = [];

console.log('[1/7] Querying Github API for official VSC language contributions.');

const octokit = new api.Octokit();
const query = {
  page: 0,
  per_page: resultsPerPage,
  q: [
    'contributes languages',
    'filename:package.json',
    'org:microsoft',
    '-repo:microsoft/azuredatastudio',
  ].join(' '),
};
const GITHUB_RATELIMIT = 6000;

(function queryLanguageContributions() {
  try {
    octokit.request('GET /search/code', query).then(
      (res) => {
        if (!res.data) throw new Error();
        query.page = index;
        index += 1;
        total = total || res.data.total_count;
        items = items.concat(res.data.items);
        if (resultsPerPage * index >= total) {
          console.log('[2/7] Fetching Microsoft language contributions from Github.');
          index = 0;
          total = items.length;
          items.forEach(fetchLanguageContribution);
        } else {
          setTimeout(queryLanguageContributions, GITHUB_RATELIMIT);
        }
      },
      (reason) => {
        throw new Error(reason);
      }
    );
  } catch (reason) {
    throw new Error(reason);
  }
})();

function fetchLanguageContribution(item) {
  const urlPath = item.html_url.replace(/\/blob\//, '/raw/');
  const resPath = item.path.replace(/package\.json$/, 'extension.json');
  const extPath = path.join(item.repository.name, resPath);
  const extDir = path.dirname(extPath);
  if (/sample|template/.test(extDir)) {
    total -= 1;
    return;
  }
  try {
    fs.ensureDir(path.join(vsDataPath, extDir)).then(() => {
      const extFile = fs.createWriteStream(path.join(vsDataPath, extPath));
      fr.https
        .get(urlPath, (res) => {
          res.pipe(extFile);
          res.on('end', () => {
            index += 1;
            if (index === total) {
              console.log('[3/7] Loading VSC language contributions into Node.');
              glob(path.join(vsDataPath, '**', 'extension.json'), (err, matches) => {
                index = 0;
                total = matches.length;
                matches.forEach(loadLanguageContribution);
              });
            }
          });
        })
        .on('error', (err) => {
          fs.unlink(extPath);
          throw err;
        });
    });
  } catch (reason) {
    throw new Error(reason);
  }
}

function loadLanguageContribution(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    data.contributes = data.contributes || {};
    data.contributes.languages = data.contributes.languages || [];
    languages.push(...data.contributes.languages);
    index += 1;
    if (index === total) {
      console.log('[4/7] Processing language contributions for VSC File Icon API compatibility.');
      index = 0;
      total = languages.length;
      languages.forEach(processLanguageContribution);
    }
  } catch (error) {
    throw new Error(`${error} (${filePath})`);
  }
}

function processLanguageContribution(language) {
  const { aliases, configuration, firstLine, ...lang } = language;

  lang.extensions = lang.extensions || [];
  lang.filenames = lang.filenames || [];
  if (lang.filenamePatterns) {
    lang.filenamePatterns.forEach((ptn) => {
      if (/^\*\.[^*/?]+$/.test(ptn)) {
        lang.extensions.push(ptn.substring(1));
      }
      if (/^[^*/?]+$/.test(ptn)) {
        lang.filenames.push(ptn);
      }
    });
    delete lang.filenamePatterns;
  }
  lang.extensions = lang.extensions
    .filter((ext) => {
      const isExt = ext.startsWith('.');
      if (!isExt) {
        lang.filenames.push(ext);
      }
      return isExt;
    })
    .map((ext) => ext.substring(1))
    .filter((ext) => !/\*|\/|\?/.test(ext));
  lang.filenames = lang.filenames.filter((name) => !/\*|\/|\?/.test(name));
  index += 1;
  if (index === total) {
    console.log('[5/7] Mapping language contributions into file icon configuration.');
    index = 0;
    languages.forEach(mapLanguageContribution);
  }
}

const languageMap = {
  fileExtensions: {},
  fileNames: {},
};

function mapLanguageContribution(lang) {
  lang.extensions.forEach((ext) => {
    let extIconName = lang.id;
    if (remap.extensions[extIconName]) {
      const overrideIcon = remap.extensions[extIconName];
      if (typeof overrideIcon === 'object') {
        Object.entries(overrideIcon).forEach(([ptn, override]) => {
          if (ptn.startsWith('^') && ext.startsWith(ptn.substring(1))) {
            extIconName = override;
          }
          if (ptn.length && ext === ptn) {
            extIconName = override;
          }
        });
      }
    } else {
      extIconName = iconMap.languageIds[extIconName] || extIconName;
    }
    if (
      !remap.deletions[`extensions:${extIconName}`] &&
      !iconMap.fileExtensions[extIconName] &&
      iconMap.iconDefinitions[extIconName]
    ) {
      languageMap.fileExtensions[ext] = extIconName;
    }
  });
  lang.filenames.forEach((name) => {
    let fileIconName = lang.id;
    if (remap.filenames[fileIconName]) {
      const overrideIcon = remap.filenames[fileIconName];
      if (typeof overrideIcon === 'object') {
        Object.entries(overrideIcon).forEach(([ptn, override]) => {
          if (ptn.startsWith('^') && name.startsWith(ptn.substring(1))) {
            fileIconName = override;
          }
          if (ptn.length && name === ptn) {
            fileIconName = override;
          }
        });
      }
    } else {
      fileIconName = iconMap.languageIds[fileIconName] || fileIconName;
    }
    if (
      !remap.deletions[`filenames:${fileIconName}`] &&
      !iconMap.fileNames[fileIconName] &&
      iconMap.iconDefinitions[fileIconName]
    ) {
      languageMap.fileNames[name] = fileIconName;
    }
  });
  index += 1;
  if (index === total) {
    index = 0;
    generateLanguageMap();
  }
}

function generateLanguageMap() {
  console.log('[6/7] Writing language contribution map to icon configuration file.');
  fs.writeFileSync(
    path.resolve(srcPath, 'language-map.json'),
    stringify(languageMap, { space: '  ' })
  );
  console.log('[7/7] Deleting language contribution cache.');
  rimraf.sync(vsDataPath);
}
