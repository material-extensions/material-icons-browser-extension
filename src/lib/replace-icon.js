import iconsList from '../icon-list.json';
import iconMap from '../icon-map.json';
import languageMap from '../language-map.json';

/**
 * Replace file/folder icons.
 *
 * @param {HTMLElement} itemRow Item Row.
 * @param {object} provider Git Provider specs.
 * @param {string | null} iconPack active icon pack. Selectable by user
 * @returns {void}
 */
export function replaceIconInRow(itemRow, provider, iconPack) {
  // Get file/folder name.
  const fileName = itemRow
    .querySelector(provider.selectors.filename)
    ?.innerText?.split('/')[0] // get first part of path for a proper icon lookup
    .trim();
  if (!fileName) return; // fileName couldn't be found or we don't have a match for it.

  // SVG to be replaced.
  const iconEl = itemRow.querySelector(provider.selectors.icon);
  if (iconEl?.getAttribute('data-material-icons-extension')) return;
  if (iconEl) replaceIcon(iconEl, fileName, itemRow, provider, iconPack);
}

function replaceIcon(iconEl, fileName, itemRow, provider, iconPack) {
  // Get Directory or Submodule type.
  const isDir = provider.getIsDirectory({ row: itemRow, icon: iconEl });
  const isSubmodule = provider.getIsSubmodule({ row: itemRow, icon: iconEl });
  const isSymlink = provider.getIsSymlink({ row: itemRow, icon: iconEl });
  const lowerFileName = fileName.toLowerCase();

  // Get file extensions.
  const fileExtensions = [];
  // Avoid doing an explosive combination of extensions for very long filenames
  // (most file systems do not allow files > 255 length) with lots of `.` characters
  // https://github.com/microsoft/vscode/issues/116199
  if (fileName.length <= 255) {
    for (let i = 0; i < fileName.length; i += 1) {
      if (fileName[i] === '.') fileExtensions.push(fileName.slice(i + 1));
    }
  }

  // Get icon name.
  let iconName = lookForMatch(
    fileName,
    lowerFileName,
    fileExtensions,
    isDir,
    isSubmodule,
    isSymlink
  ); // returns icon name if found or undefined.

  const isLightTheme = provider.getIsLightTheme();
  if (isLightTheme) {
    iconName = lookForLightMatch(iconName, fileName, fileExtensions, isDir); // returns icon name if found for light mode or undefined.
  }

  replaceElementWithIcon(iconEl, iconName, fileName, iconPack, provider);
}

export function replaceElementWithIcon(iconEl, iconName, fileName, iconPack, provider) {
  // Get folder icon from active icon pack.
  const svgFileName = lookForIconPackMatch(iconPack, fileName.toLowerCase()) ?? iconName;

  if (!svgFileName) return;

  const newSVG = document.createElement('img');
  newSVG.setAttribute('data-material-icons-extension', 'icon');
  newSVG.setAttribute('data-material-icons-extension-iconname', iconName);
  newSVG.setAttribute('data-material-icons-extension-filename', fileName);
  newSVG.src = chrome.runtime.getURL(`${svgFileName}.svg`);

  provider.replaceIcon(iconEl, newSVG);
}

/**
 * Lookup for matched file/folder icon name.
 *
 * @since 1.0.0
 * @param {string} fileName File name.
 * @param {string} lowerFileName Lowercase file name.
 * @param {string[]} fileExtensions File extensions.
 * @param {boolean} isDir Check if directory type.
 * @param {boolean} isSubmodule Check if submodule type.
 * @param {boolean} isSymlink Check if symlink
 * @returns {string} The matched icon name.
 */
function lookForMatch(fileName, lowerFileName, fileExtensions, isDir, isSubmodule, isSymlink) {
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
  for (const ext of fileExtensions) {
    if (iconMap.fileExtensions[ext] && !isDir && !isSubmodule)
      return iconMap.fileExtensions[ext];
    if (iconMap.languageIds[ext] && !isDir && !isSubmodule)
      return iconMap.languageIds[ext];
  }

  // Look for filename and extension in VSCode language map.
  if (languageMap.fileNames[fileName] && !isDir && !isSubmodule)
    return languageMap.fileNames[fileName];
  if (languageMap.fileNames[lowerFileName] && !isDir && !isSubmodule)
    return languageMap.fileNames[lowerFileName];
  for (const ext of fileExtensions) {
    if (languageMap.fileExtensions[ext] && !isDir)
      return languageMap.fileExtensions[ext];
  }

  // Fallback into default file or folder if no matches.
  if (isDir) return 'folder';
  return 'file';
}

/**
 * Lookup for matched light file/folder icon name.
 *
 * @since 1.4.0
 * @param {string} iconName Icon name.
 * @param {string} fileName File name.
 * @param {string[]} fileExtensions File extension.
 * @param {boolean} isDir Check if directory or file type.
 * @returns {string} The matched icon name.
 */
function lookForLightMatch(iconName, fileName, fileExtensions, isDir) {
  // First look in fileNames and folderNames.
  if (iconMap.light.fileNames[fileName] && !isDir) return iconMap.light.fileNames[fileName];
  if (iconMap.light.folderNames[fileName] && isDir) return iconMap.light.folderNames[fileName];

  // Look for extension in fileExtensions and languageIds.
  for (const ext of fileExtensions) {
    if (iconMap.light.fileExtensions[ext] && !isDir)
      return iconMap.light.fileExtensions[ext];
  }

  return iconName;
}

/**
 * Lookup for matched icon from active icon pack.
 *
 * @since 1.4.0
 * @param {string | null} iconPack active icon pack. Selectable by user
 * @param {string} lowerFileName Lowercase file name.
 * @returns {string | null} The matched icon name.
 */
function lookForIconPackMatch(iconPack, lowerFileName) {
  if (!iconPack) return null;
  switch (iconPack) {
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
  return null;
}
