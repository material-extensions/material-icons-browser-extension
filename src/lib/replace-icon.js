import iconsList from '../icon-list.json';
import iconMap from '../icon-map.json';
import languageMap from '../language-map.json';

/**
 * A helper function to check if an object has a key value, without including prooerties from the prototype chain.
 *
 * @see https://eslint.org/docs/latest/rules/no-prototype-builtins
 * @param {object} obj An object to check for a key.
 * @param {string} key A string represeing a key to find in the object.
 * @returns {boolean} Whether the object contains the key or not.
 */
function objectHas(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

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

  // If it's a file.
  if (!isDir) {
    // First look in fileNames
    if (objectHas(iconMap.fileNames, fileName)) return iconMap.fileNames[fileName];

    // Then check all lowercase
    if (objectHas(iconMap.fileNames, lowerFileName)) return iconMap.fileNames[lowerFileName];

    // Look for extension in fileExtensions and languageIds.
    for (const ext of fileExtensions) {
      if (objectHas(iconMap.fileExtensions, ext)) return iconMap.fileExtensions[ext];
      if (objectHas(iconMap.languageIds, ext)) return iconMap.languageIds[ext];
    }

    // Look for filename and extension in VSCode language map.
    if (objectHas(languageMap.fileNames, fileName)) return languageMap.fileNames[fileName];
    if (objectHas(languageMap.fileNames, lowerFileName))
      return languageMap.fileNames[lowerFileName];
    for (const ext of fileExtensions) {
      if (objectHas(languageMap.fileExtensions, ext)) return languageMap.fileExtensions[ext];
    }

    // Fallback into default file if no matches.
    return 'file';
  }

  // Otherwise, it's a folder.
  // First look in folderNames.
  if (objectHas(iconMap.folderNames, fileName)) return iconMap.folderNames[fileName];

  // Then check all lowercase.
  if (objectHas(iconMap.folderNames, lowerFileName)) return iconMap.folderNames[lowerFileName];

  // Fallback into default folder if no matches.
  return 'folder';
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
    if (iconMap.light.fileExtensions[ext] && !isDir) return iconMap.light.fileExtensions[ext];
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
      if (objectHas(iconsList, `folder-angular-${lowerFileName}.svg`))
        return `folder-angular-${lowerFileName}`;
      break;
    case 'angular_ngrx':
      if (objectHas(iconsList, `folder-ngrx-${lowerFileName}.svg`))
        return `folder-ngrx-${lowerFileName}`;
      if (objectHas(iconsList, `folder-angular-${lowerFileName}.svg`))
        return `folder-angular-${lowerFileName}`;
      break;
    case 'react':
    case 'react_redux':
      if (objectHas(iconsList, `folder-react-${lowerFileName}.svg`)) {
        return `folder-react-${lowerFileName}`;
      }
      if (objectHas(iconsList, `folder-redux-${lowerFileName}.svg`)) {
        return `folder-redux-${lowerFileName}`;
      }
      break;
    case 'vue':
    case 'vue_vuex':
      if (objectHas(iconsList, `folder-vuex-${lowerFileName}.svg`)) {
        return `folder-vuex-${lowerFileName}`;
      }
      if (objectHas(iconsList, `folder-vue-${lowerFileName}.svg`)) {
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
