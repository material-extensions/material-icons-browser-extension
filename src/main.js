/**
 * External depedencies.
 */
import { observe } from 'selector-observer';

/**
 * Internal depedencies.
 */
import iconsList from './icon-list.json';
import iconMap from './icon-map.json';
import languageMap from './language-map.json';

import providerConfig from './providers';

// Expected configuration.
iconMap.options = {
  ...iconMap.options,
  ...{
    activeIconPack: 'react_redux',
    // activeIconPack: 'nest', // TODO: implement interface to choose pack
  },
};

// replacing all icons synchronously prevents visual "blinks" but can
// cause missing icons/rendering delay in very large folders
// replacing asynchronously instead fixes problems in large folders, but introduces "blinks"
// Here we compromise, rushing the first n replacements to prevent blinks that will likely be "above the fold"
// and delaying the replacement of subsequent rows
let executions = 0;
let timerID;
const rushFirst = (rushBatch, callback) => {
  if (executions <= rushBatch) {
    callback(); // immediately run to prevent visual "blink"
    setTimeout(callback, 20); // run again later to catch any icons that are missed in large repositories
    executions += 1;
  } else {
    setTimeout(callback, 0); // run without blocking to prevent delayed rendering of large folders too much
    clearTimeout(timerID);
    timerID = setTimeout(() => {
      executions = 0;
    }, 1000); // reset execution tracker
  }
};

/**
 * Get all selectors and functions specific to the Git provider
 *
 * @returns {object} All of the values needed for the provider
 */
const getGitProvider = () => {
  const hostname = window.location.hostname;

  switch (hostname) {
    case 'github.com':
      return providerConfig.github;

    case 'bitbucket.org':
      return providerConfig.bitbucket;

    case 'dev.azure.com':
      return providerConfig.azure;

    default:
      return null;
  }
};

const gitProvider = getGitProvider();

// Monitor DOM elements that match a CSS selector.
if (gitProvider) {
  observe(gitProvider.selectors.row, {
    add(row) {
      const callback = () => replaceIcon(row, gitProvider);

      rushFirst(90, callback);

      gitProvider.onAdd(row, callback);
    },
  });
}

/**
 * Replace file/folder icons.
 *
 * @param {HTMLElement} itemRow Item Row.
 * @param {object} Git provider object
 * @return {undefined}
 */
function replaceIcon(itemRow, provider) {
  const isLightTheme = provider.getIsLightTheme();

  // Get file/folder name.
  const fileName = itemRow.querySelector(provider.selectors.filename)?.innerText.trim();
  if (!fileName) return; // fileName couldn't be found or we don't have a match for it.

  // Get file extension.
  const fileExtension = fileName.match(/.*?[.](?<ext>xml.dist|xml.dist.sample|yml.dist|\w+)$/)?.[1];

  // SVG to be replaced.
  const svgEl = itemRow.querySelector(provider.selectors.icon);
  if (!svgEl) return; // couldn't find svg element.

  // Get Directory or Submodule type.
  const isDir = provider.getIsDirectory(svgEl);
  const isSubmodule = provider.getIsSubmodule(svgEl);
  const isSymlink = provider.getIsSymlink(svgEl);
  const lowerFileName = fileName.toLowerCase();

  // Get icon name.
  let iconName = lookForMatch(
    fileName,
    lowerFileName,
    fileExtension,
    isDir,
    isSubmodule,
    isSymlink
  ); // returns icon name if found or undefined.
  if (isLightTheme) {
    iconName = lookForLightMatch(iconName, fileName, fileExtension, isDir); // returns icon name if found for light mode or undefined.
  }

  // Get folder icon from active icon pack.

  if (iconMap.options.activeIconPack) {
    iconName = lookForIconPackMatch(lowerFileName) ?? iconName;
  }

  if (!iconName) return;

  const newSVG = document.createElement('img');
  newSVG.src = chrome.runtime.getURL(`${iconName}.svg`);

  provider.replaceIcon(svgEl, newSVG);
}

/**
 * Lookup for matched file/folder icon name.
 *
 * @since 1.0.0
 *
 * @param {String} fileName File name.
 * @param {String} lowerFileName Lowercase file name.
 * @param {String} fileExtension File extension.
 * @param {Boolean} isDir Check if directory type.
 * @param {Boolean} isSubmodule Check if submodule type.
 * @param {Boolean} isSymlink Check if symlink
 * @returns {String} The matched icon name.
 */
function lookForMatch(fileName, lowerFileName, fileExtension, isDir, isSubmodule, isSymlink) {
  if (isSubmodule) return 'folder-git';
  if (isSymlink) return 'folder-symlink';

  // First look in fileNames and folderNames.
  if (iconMap.fileNames[fileName] && !isDir && !isSubmodule) return iconMap.fileNames[fileName];
  if (iconMap.folderNames[fileName] && isDir && !isSubmodule) return iconMap.folderNames[fileName];

  // Then check all lowercase.
  if (iconMap.fileNames[lowerFileName] && !isDir && !isSubmodule)
    return iconMap.fileNames[lowerFileName];
  if (iconMap.folderNames[lowerFileName] && isDir && !isSubmodule)
    return iconMap.folderNames[lowerFileName];

  // Look for extension in fileExtensions and languageIds.
  if (iconMap.fileExtensions[fileExtension] && !isDir && !isSubmodule)
    return iconMap.fileExtensions[fileExtension];
  if (iconMap.languageIds[fileExtension] && !isDir && !isSubmodule)
    return iconMap.languageIds[fileExtension];

  // Look for filename and extension in VSCode language map.
  if (languageMap.fileNames[fileName] && !isDir && !isSubmodule)
    return languageMap.fileNames[fileName];
  if (languageMap.fileNames[lowerFileName] && !isDir && !isSubmodule)
    return languageMap.fileNames[lowerFileName];
  if (languageMap.fileExtensions[fileExtension] && !isDir)
    return languageMap.fileExtensions[fileExtension];

  // Fallback into default file or folder if no matches.
  if (isDir) return 'folder';
  return 'file';
}

/**
 * Lookup for matched light file/folder icon name.
 *
 * @since 1.4.0
 *
 * @param {String} iconName Icon name.
 * @param {String} fileName File name.
 * @param {String} fileExtension File extension.
 * @param {Boolean} isDir Check if directory or file type.
 * @returns {String} The matched icon name.
 */
function lookForLightMatch(iconName, fileName, fileExtension, isDir) {
  // First look in fileNames and folderNames.
  if (iconMap.light.fileNames[fileName] && !isDir) return iconMap.light.fileNames[fileName];
  if (iconMap.light.folderNames[fileName] && isDir) return iconMap.light.folderNames[fileName];

  // Look for extension in fileExtensions and languageIds.
  if (iconMap.light.fileExtensions[fileExtension] && !isDir)
    return iconMap.light.fileExtensions[fileExtension];

  return iconName;
}

/**
 * Lookup for matched icon from active icon pack.
 *
 * @since 1.4.0
 *
 * @param {String} lowerFileName Lowercase file name.
 * @returns {String} The matched icon name.
 */
function lookForIconPackMatch(lowerFileName) {
  if (iconMap.options.activeIconPack) {
    switch (iconMap.options.activeIconPack) {
      case 'angular':
      case 'angular_ngrx':
        if (iconsList[`folder-react-${lowerFileName}.svg`]) return `folder-ngrx-${lowerFileName}`;
        break;
      case 'react':
      case 'react_redux':
        if (iconsList[`folder-react-${lowerFileName}.svg`]) {
          return `folder-react-${lowerFileName}`;
        }
        if (iconsList[`folder-redux-${lowerFileName}.svg`]) {
          return `folder-redux-${lowerFileName}`;
        }
        break;
      case 'vue':
      case 'vue_vuex':
        if (iconsList[`folder-vuex-${lowerFileName}.svg`]) {
          return `folder-vuex-${lowerFileName}`;
        }
        if (iconsList[`folder-vue-${lowerFileName}.svg`]) {
          return `folder-vue-${lowerFileName}`;
        }
        if (lowerFileName === 'nuxt') {
          return `folder-nuxt`;
        }
        break;
      case 'nest':
        switch (true) {
          case /\.controller\.(t|j)s$/.test(lowerFileName):
            return `nest-controller`;
          case /\.middleware\.(t|j)s$/.test(lowerFileName):
            return 'nest-middleware';
          case /\.module\.(t|j)s$/.test(lowerFileName):
            return 'nest-module';
          case /\.service\.(t|j)s$/.test(lowerFileName):
            return 'nest-service';
          case /\.decorator\.(t|j)s$/.test(lowerFileName):
            return 'nest-decorator';
          case /\.pipe\.(t|j)s$/.test(lowerFileName):
            return 'nest-pipe';
          case /\.filter\.(t|j)s$/.test(lowerFileName):
            return 'nest-filter';
          case /\.gateway\.(t|j)s$/.test(lowerFileName):
            return 'nest-gateway';
          case /\.guard\.(t|j)s$/.test(lowerFileName):
            return 'nest-guard';
          case /\.resolver\.(t|j)s$/.test(lowerFileName):
            return 'nest-resolver';
          default:
            return null;
        }
      default:
        return null;
    }
  }
  return null;
}
