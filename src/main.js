/**
 * External depedencies
 */
import { observe } from 'selector-observer';

/**
 * Internal depedencies
 */
import iconMap from './iconMap';
import iconsCache from './iconsCache';

// Monitor DOM elements that match a CSS selector.
observe('.js-navigation-container > .js-navigation-item', {
  add(row) {
    replaceIcon(row, iconMap);
  },
});

/**
 * Replace file/folder icons.
 *
 * @since 1.0.0
 *
 * @param {*} fileRow File Row.
 * @param {*} iconMap Icon Map.
 * @return {undefined}
 */
function replaceIcon(fileRow, iconMap) {
  // Get file/folder name.
  const fileName =
    fileRow.querySelector('[role=rowheader]')?.firstElementChild?.firstElementChild?.innerText;
  if (!fileName) return; // fileName couldn't be found or we don't have a match for it.

  // SVG to be replaced.
  const svgEl = fileRow.querySelector('.octicon');
  if (!svgEl) return; // couldn't find svg element.

  // Get Directory or File type.
  const isDir = svgEl.getAttribute('aria-label') === 'Directory';

  // Get icon filename.
  const iconName = lookForMatch(fileName, isDir, iconMap); // returns iconname if found or undefined.
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
 * @param {*} fileName File name.
 * @param {*} isDir Check if directory or file type.
 * @param {*} iconMap Icon map.
 * @returns {string} The matched icon name.
 */
function lookForMatch(fileName, isDir, iconMap) {
  const lowerFileName = fileName.toLowerCase();
  const captureExtension = /.+(?<=\.)(.+)$/;
  const extension = fileName.match(captureExtension)?.[1];
  const isLightTheme = window.matchMedia('(prefers-color-scheme: light)').matches;
  iconMap.fileExtensions = {
    ...iconMap.fileExtensions,
    ...{
      js: 'javascript',
      ts: 'typescript',
    },
  };

  // First look in fileNames and folderNames.
  if (iconMap.fileNames[fileName] && !isDir) {
    return isLightTheme && iconMap.light.fileNames[fileName]
      ? iconMap.light.fileNames[fileName]
      : iconMap.fileNames[fileName];
  }
  if (iconMap.folderNames[fileName] && isDir) {
    return isLightTheme && iconMap.light.folderNames[fileName]
      ? iconMap.light.folderNames[fileName]
      : iconMap.folderNames[fileName];
  }

  // Then check all lowercase.
  if (iconMap.fileNames[lowerFileName] && !isDir) {
    return isLightTheme && iconMap.light.fileNames[lowerFileName]
      ? iconMap.light.fileNames[lowerFileName]
      : iconMap.fileNames[lowerFileName];
  }
  if (iconMap.folderNames[lowerFileName] && isDir) {
    return isLightTheme && iconMap.light.folderNames[lowerFileName]
      ? iconMap.light.folderNames[lowerFileName]
      : iconMap.folderNames[lowerFileName];
  }

  // Look for extension in fileExtensions and languageIds.
  if (iconMap.fileExtensions[extension] && !isDir) {
    return isLightTheme && iconMap.light.fileExtensions[extension]
      ? iconMap.light.fileExtensions[extension]
      : iconMap.fileExtensions[extension];
  }
  if (iconMap.languageIds[extension] && !isDir) {
    return iconMap.languageIds[extension];
  }

  // fallback into default file or folder if no matches.
  if (!isDir) return 'file';
  if (isDir) return 'folder';
}
