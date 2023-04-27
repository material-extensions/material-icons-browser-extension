const path = require('path');
const api = require('@octokit/core');
const fs = require('fs-extra');
const fetch = require('node-fetch');
const stringify = require('json-stable-stringify');
const iconMap = require('../src/icon-map.json');

const vsDataPath = path.resolve(__dirname, '..', 'data');
const srcPath = path.resolve(__dirname, '..', 'src');

let index = 0;
let total;
const items = [];
const contributions = [];
const languages = [];

const resultsPerPage = 100; // max 100
const octokit = new api.Octokit({
  auth: process.env.GITHUB_TOKEN,
});
const query = {
  page: 0,
  per_page: resultsPerPage,
  q: 'contributes languages filename:package.json repo:microsoft/vscode',
};
const GITHUB_RATELIMIT = 6000;

async function main() {
  await fs.remove(vsDataPath);
  await fs.ensureDir(vsDataPath);
  await fs.remove(path.resolve(srcPath, 'language-map.json'));

  console.log('[1/7] Querying Github API for official VSC language contributions.');
  queryLanguageContributions();
}

main();

async function queryLanguageContributions() {
  const res = await octokit.request('GET /search/code', query);
  if (!res.data) throw new Error();
  query.page = index;
  index += 1;
  if (!total) total = res.data.total_count;
  items.push(...res.data.items);
  if (resultsPerPage * index >= total) {
    console.log('[2/7] Fetching Microsoft language contributions from Github.');
    index = 0;
    total = items.length;
    items.forEach(fetchLanguageContribution);
  } else {
    setTimeout(queryLanguageContributions, GITHUB_RATELIMIT);
  }
}

async function fetchLanguageContribution(item) {
  const rawUrl = item.html_url.replace('/blob/', '/raw/');
  const resPath = item.path.replace(/[^/]+$/, 'extension.json');
  const extPath = path.join(vsDataPath, resPath);
  let extManifest;
  try {
    extManifest = await fetch(rawUrl);
    extManifest = await extManifest.text();
  } catch (reason) {
    throw new Error(reason);
  }
  try {
    await fs.ensureDir(path.dirname(extPath));
    await fs.writeFile(extPath, extManifest, 'utf-8');
  } catch (reason) {
    throw new Error(`${reason} (${extPath})`);
  }
  items[index] = [extPath, extManifest];
  index += 1;
  if (index === total) {
    console.log('[3/7] Loading VSC language contributions into Node.');
    index = 0;
    items.forEach(loadLanguageContribution);
  }
}

function loadLanguageContribution([extPath, extManifest]) {
  let data;
  try {
    data = JSON.parse(extManifest.replace(/#\w+_\w+#/g, '0'));
  } catch (error) {
    throw new Error(`${error} (${extPath})`);
  }
  if (!data.contributes || !data.contributes.languages) {
    total -= 1;
    return;
  }
  contributions.push(...data.contributes.languages);
  index += 1;
  if (index === total) {
    console.log('[4/7] Processing language contributions for VSC File Icon API compatibility.');
    index = 0;
    total = contributions.length;
    contributions.forEach(processLanguageContribution);
  }
}

function processLanguageContribution(contribution) {
  const { id, filenamePatterns } = contribution;
  let { extensions, filenames } = contribution;
  extensions = extensions || [];
  filenames = filenames || [];
  if (filenamePatterns) {
    filenamePatterns.forEach((ptn) => {
      if (/^\*\.[^*/?]+$/.test(ptn)) {
        extensions.push(ptn.substring(1));
      }
      if (/^[^*/?]+$/.test(ptn)) {
        filenames.push(ptn);
      }
    });
  }
  extensions = extensions
    .map((ext) => (ext.charAt(0) === '.' ? ext.substring(1) : ext))
    .filter((ext) => !/\*|\/|\?/.test(ext));
  filenames = filenames.filter((name) => !/\*|\/|\?/.test(name));
  if (!filenames.length && !extensions.length) {
    total -= 1;
    return;
  }
  const language = languages.find((lang) => lang.id === id);
  if (language) {
    language.filenames.push(...filenames);
    language.extensions.push(...extensions);
  } else {
    languages.push({ id, extensions, filenames });
  }
  index += 1;
  if (index === total) {
    console.log('[5/7] Mapping language contributions into file icon configuration.');
    index = 0;
    total = languages.length;
    languages.forEach(mapLanguageContribution);
  }
}

const languageMap = {};
languageMap.fileExtensions = {};
languageMap.fileNames = {};

function mapLanguageContribution(lang) {
  const langIcon = iconMap.languageIds[lang.id];
  lang.extensions.forEach((ext) => {
    const iconName = iconMap.fileExtensions[ext] || langIcon;
    if (!iconMap.fileExtensions[ext] && iconName && iconMap.iconDefinitions[iconName]) {
      languageMap.fileExtensions[ext] = iconName;
    }
  });
  lang.filenames.forEach((name) => {
    const iconName = iconMap.fileNames[name] || langIcon;
    if (
      !iconMap.fileNames[name] &&
      !(name.startsWith('.') && iconMap.fileExtensions[name.substring(1)]) &&
      iconName &&
      iconMap.iconDefinitions[iconName]
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

async function generateLanguageMap() {
  console.log('[6/7] Writing language contribution map to icon configuration file.');
  fs.writeFileSync(
    path.resolve(srcPath, 'language-map.json'),
    stringify(languageMap, { space: '  ' })
  );
  console.log('[7/7] Deleting language contribution cache.');
  await fs.remove(vsDataPath);
}
