/**
 * External depedencies.
 */
import { observe } from 'selector-observer';

/**
 * Internal depedencies.
 */
import iconsCache from './icon-cache';
import iconMap from './icon-map';
import languageMap from './language-map';

// Expected configuration.
iconMap.options = {
  ...iconMap.options,
  ...{
    activeIconPack: 'react_redux',
  },
};

// Monitor DOM elements that match a CSS selector.
observe('.js-navigation-container[role=grid] > .js-navigation-item', {
  add(row) {
    setTimeout(() => {
      replaceIcon(row, iconMap);
    }, 0);
  },
});

/**
 * Replace file/folder icons.
 *
 * @since 1.0.0
 *
 * @param {String} itemRow Item Row.
 * @param {Object} iconMap Icon Map.
 * @return {undefined}
 */
function replaceIcon(itemRow, iconMap) {
  const isLightTheme = window.matchMedia('(prefers-color-scheme: light)').matches;

  // Get file/folder name.
  const fileName =
    itemRow.querySelector('[role=rowheader]')?.firstElementChild?.firstElementChild?.innerText;
  if (!fileName) return; // fileName couldn't be found or we don't have a match for it.

  // Get file extension.
  const fileExtension = fileName.match(/.*?[.](?<ext>xml.dist|yml.dist|\w+)$/)?.[1];

  // SVG to be replaced.
  const svgEl = itemRow.querySelector('.octicon');
  if (!svgEl) return; // couldn't find svg element.

  // Get Directory or Submodule type.
  const isDir = svgEl.getAttribute('aria-label') === 'Directory';
  const isSubmodule = svgEl.getAttribute('aria-label') === 'Submodule';
  const lowerFileName = fileName.toLowerCase();

  // Get icon name.
  let iconName = lookForMatch(fileName, lowerFileName, fileExtension, isDir, isSubmodule, iconMap); // returns icon name if found or undefined.
  if (isLightTheme) {
    iconName = lookForLightMatch(iconName, fileName, fileExtension, isDir, iconMap); // returns icon name if found for light mode or undefined.
  }

  // Get folder icon from active icon pack.
  if (iconMap.options.activeIconPack && isDir) {
    iconName = lookForIconPackMatch(iconName, lowerFileName, iconMap);
  }

  if (!iconName) return;

  const { innerHtml, viewBox } = iconsCache[iconName + '.svg'];
  if (!innerHtml || !viewBox) return;

  // Must first reset innerHTML on svgEl to innerHTML of our svg.
  svgEl.innerHTML = innerHtml;
  // Finally set viewBox on svgEl to viewBox on our icon.
  svgEl.setAttribute('viewBox', viewBox);
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
 * @param {Object} iconMap Icon map.
 * @returns {String} The matched icon name.
 */
function lookForMatch(fileName, lowerFileName, fileExtension, isDir, isSubmodule, iconMap) {
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
  if (isSubmodule) return 'folder-git';
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
 * @param {Object} iconMap Icon map.
 * @returns {String} The matched icon name.
 */
function lookForLightMatch(iconName, fileName, fileExtension, isDir, iconMap) {
  // First look in fileNames and folderNames.
  if (iconMap.light.fileNames[fileName] && !isDir) return iconMap.light.fileNames[fileName];
  if (iconMap.light.folderNames[fileName] && isDir) return iconMap.light.folderNames[fileName];

  // Look for extension in fileExtensions and languageIds.
  if (iconMap.light.fileExtensions[fileExtension] && !isDir)
    return iconMap.light.fileExtensions[fileExtension];

  return iconName;
}

/**
 * Lookup for matched folder icon from active icon pack.
 *
 * @since 1.4.0
 *
 * @param {String} iconName Icon name.
 * @param {String} lowerFileName Lowercase file name.
 * @param {Object} iconMap Icon map.
 * @returns {String} The matched icon name.
 */
function lookForIconPackMatch(iconName, lowerFileName, iconMap) {
  if (iconMap.options.activeIconPack) {
    switch (iconMap.options.activeIconPack) {
      case 'angular':
      case 'angular_ngrx':
        if (iconsCache[`folder-react-${lowerFileName}.svg`]) return `folder-ngrx-${lowerFileName}`;
        break;
      case 'react':
      case 'react_redux':
        if (iconsCache[`folder-react-${lowerFileName}.svg`]) {
          return `folder-react-${lowerFileName}`;
        } else if (iconsCache[`folder-redux-${lowerFileName}.svg`]) {
          return `folder-redux-${lowerFileName}`;
        }
        break;
      case 'vue':
      case 'vue_vuex':
        if (iconsCache[`folder-vuex-${lowerFileName}.svg`]) {
          return `folder-vuex-${lowerFileName}`;
        } else if (iconsCache[`folder-vue-${lowerFileName}.svg`]) {
          return `folder-vue-${lowerFileName}`;
        } else if ('nuxt' === lowerFileName) {
          return `folder-nuxt`;
        }
        break;
    }
  }

  return iconName;
}
