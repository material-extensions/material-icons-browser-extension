const rimraf = require('rimraf');
const path = require('path');
const api = require('@octokit/core');
const fs = require('fs-extra');
const fr = require('follow-redirects');
const glob = require('glob');
const stringify = require('json-stable-stringify');
const overrideMap = require('./language-overrides.json');
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

const octokit = new api.Octokit();
const query = {
  page: 0,
  per_page: resultsPerPage,
  q: 'contributes languages filename:package.json repo:microsoft/vscode'
};
const GITHUB_RATELIMIT = 6000;

console.log('[1/7] Querying Github API for official VSC language contributions.');
queryLanguageContributions()

function queryLanguageContributions() {
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
}

function fetchLanguageContribution(item) {
  const urlPath = item.html_url.replace(/\/blob\//, '/raw/');
  const resPath = item.path.replace(/[^/]+$/, 'extension.json');
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
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8').replace(/#\w+_\w+#/g, '0'));
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
    .map((ext) => ext.charAt(0) === '.' ? ext.substring(1) : ext)
    .filter((ext) => !/\*|\/|\?/.test(ext));
  lang.filenames = lang.filenames.filter((name) => !/\*|\/|\?/.test(name));
  languages[index] = lang;
  index += 1;
  if (index === total) {
    console.log('[5/7] Mapping language contributions into file icon configuration.');
    index = 0;
    languages.forEach(mapLanguageContribution);
  }
}

const languageMap = {};
languageMap.fileExtensions = {};
languageMap.fileNames = {};

function mapLanguageContribution(lang) {
  lang.extensions.forEach((ext) => {
    const iconName = handleIconRemapping(lang.id, 'extensions', 'fileExtensions', ext);
    if (
      !overrideMap.deletions[`extensions:${lang.id}`] &&
      !iconMap.fileExtensions[ext] &&
      iconName && iconMap.iconDefinitions[iconName]
    ) {
      languageMap.fileExtensions[ext] = iconName;
    }
  });
  lang.filenames.forEach((name) => {
    const iconName = handleIconRemapping(lang.id, 'filenames', 'fileNames', name);
    if (
      !overrideMap.deletions[`filenames:${lang.id}`] &&
      !iconMap.fileNames[name] &&
      iconName && iconMap.iconDefinitions[iconName]
    ) {
      languageMap.fileNames[name] = iconName;
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

function handleIconRemapping(language, overrideType, contributionType, value) {
  const override = overrideMap[overrideType][language];
  if (typeof override === 'object') {
    if (override[value]) {
      return override[value];
    }
    const matchedPattern = Object.keys(override)
      .filter(p => p.charAt(0) === '^')
      .find(p => value.startsWith(p.substring(1)));
    if (matchedPattern) {
      return override[matchedPattern];
    }
  }
  if (typeof override === 'string') {
    return override;
  }
  return iconMap[contributionType][value] || iconMap.languageIds[language];
}
