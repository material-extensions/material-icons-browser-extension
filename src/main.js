/**
 * External depedencies
 */
import { observe } from 'selector-observer';

/**
 * Internal depedencies
 */
import iconMap from './iconMap';
import iconsCache from './iconsCache';

// Expected configuration.
iconMap.fileExtensions = {
  ...iconMap.fileExtensions,
  ...{
    js: 'javascript',
    ts: 'typescript',
  },
};

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
 * @param {String} fileRow File Row.
 * @param {Object} iconMap Icon Map.
 * @return {undefined}
 */
function replaceIcon(fileRow, iconMap) {
  const isLightTheme = window.matchMedia('(prefers-color-scheme: light)').matches;

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
  let iconName = lookForMatch(fileName, isDir, iconMap); // returns iconname if found or undefined.
  if (isLightTheme && iconMap.light.fileNames[fileName])
    iconName = iconMap.light.fileNames[fileName];
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
 * @param {Boolean} isDir Check if directory or file type.
 * @param {Object} iconMap Icon map.
 * @returns {String} The matched icon name.
 */
function lookForMatch(fileName, isDir, iconMap) {
  const lowerFileName = fileName.toLowerCase();
  const fileExtension = fileName.match(/.*?[.](?<ext>xml.dist|yml.dist|\w+)$/)?.[1];

  // First look in fileNames and folderNames.
  if (iconMap.fileNames[fileName] && !isDir) return iconMap.fileNames[fileName];
  if (iconMap.folderNames[fileName] && isDir) return iconMap.folderNames[fileName];

  // Then check all lowercase.
  if (iconMap.fileNames[lowerFileName] && !isDir) return iconMap.fileNames[lowerFileName];
  if (iconMap.folderNames[lowerFileName] && isDir) return iconMap.folderNames[lowerFileName];

  // Look for extension in fileExtensions and languageIds.
  if (iconMap.fileExtensions[fileExtension] && !isDir) return iconMap.fileExtensions[fileExtension];
  if (iconMap.languageIds[fileExtension] && !isDir) return iconMap.languageIds[fileExtension];

  // Fallback into default file or folder if no matches.
  if (!isDir) return 'file';
  if (isDir) return 'folder';
}
