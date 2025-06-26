import { Manifest } from 'material-icon-theme';
import Browser from 'webextension-polyfill';
import iconsList from '../icon-list.json';
import languageMap from '../language-map.json';
import { Provider } from '../models';

const iconsListTyped = iconsList as Record<string, string>;
const languageMapTyped = languageMap as {
  fileExtensions: Record<string, string>;
  fileNames: Record<string, string>;
};

export function replaceIconInRow(
  itemRow: HTMLElement,
  provider: Provider,
  manifest: Manifest
): void {
  let fileName = itemRow
    .querySelector(provider.selectors.filename)
    ?.textContent // get the last folder for the icon
    ?.split('/')
    .reverse()[0]
    // when using textContent, it can add multiple types of whitespace,
    // using regex to replace them with a single space,
    // can be used later to transform the filename
    .replace(/\s+/g, ' ')
    .trim();
  if (!fileName) return;

  const iconEl = itemRow.querySelector(
    provider.selectors.icon
  ) as HTMLElement | null;
  if (iconEl?.getAttribute('data-material-icons-extension')) return;

  if (!iconEl) return;

  fileName = provider.transformFileName(itemRow, iconEl, fileName);

  replaceIcon(iconEl, fileName, itemRow, provider, manifest);
}

function replaceIcon(
  iconEl: HTMLElement,
  fileName: string,
  itemRow: HTMLElement,
  provider: Provider,
  manifest: Manifest
): void {
  const isDir = provider.getIsDirectory({ row: itemRow, icon: iconEl });
  const isSubmodule = provider.getIsSubmodule({ row: itemRow, icon: iconEl });
  const isSymlink = provider.getIsSymlink({ row: itemRow, icon: iconEl });

  // Check for customMappings and use the first matching mapping's iconName
  let customIconName: string | undefined;
  if (provider.customMappings) {
    for (const mapping of provider.customMappings) {
      if (mapping.match({ row: itemRow, icon: iconEl })) {
        customIconName = mapping.iconName;
        break;
      }
    }
  }

  const lowerFileName = fileName.toLowerCase();
  const fileExtensions: string[] = [];
  if (fileName.length <= 255) {
    for (let i = 0; i < fileName.length; i += 1) {
      if (fileName[i] === '.') fileExtensions.push(lowerFileName.slice(i + 1));
    }
  }

  let iconName = customIconName;
  if (!iconName) {
    iconName = lookForMatch(
      fileName,
      lowerFileName,
      fileExtensions,
      isDir,
      isSubmodule,
      isSymlink,
      manifest
    );
  }

  const isLightTheme = provider.getIsLightTheme();
  if (isLightTheme) {
    iconName = lookForLightMatch(
      iconName,
      fileName,
      fileExtensions,
      isDir,
      manifest
    );
  }

  // get correct icon name from icon list
  iconName = iconsListTyped[iconName] ?? (isDir ? 'folder.svg' : 'file.svg');

  replaceElementWithIcon(iconEl, iconName, fileName, provider);
}

export function replaceElementWithIcon(
  iconEl: HTMLElement,
  iconName: string,
  fileName: string,
  provider: Provider
): void {
  const newSVG = document.createElement('img');
  newSVG.setAttribute('data-material-icons-extension', 'icon');
  newSVG.setAttribute('data-material-icons-extension-iconname', iconName ?? '');
  newSVG.setAttribute('data-material-icons-extension-filename', fileName);
  newSVG.src = Browser.runtime.getURL(iconName);

  provider.replaceIcon(iconEl, newSVG);
}

function lookForMatch(
  fileName: string,
  lowerFileName: string,
  fileExtensions: string[],
  isDir: boolean,
  isSubmodule: boolean,
  isSymlink: boolean,
  manifest: Manifest
): string {
  if (isSubmodule) return 'folder-git';
  if (isSymlink) return 'folder-symlink';

  if (!isDir) {
    if (manifest.fileNames?.[fileName]) return manifest.fileNames?.[fileName];
    if (manifest.fileNames?.[lowerFileName])
      return manifest.fileNames?.[lowerFileName];

    for (const ext of fileExtensions) {
      if (manifest.fileExtensions?.[ext]) return manifest.fileExtensions?.[ext];
      if (manifest.languageIds?.[ext]) return manifest.languageIds?.[ext];
    }

    const languageIcon = getLanguageIcon(
      fileName,
      lowerFileName,
      fileExtensions
    );

    if (languageIcon)
      return manifest.languageIds?.[languageIcon] ?? languageIcon;

    return 'file';
  }

  if (manifest.folderNames?.[fileName]) return manifest.folderNames?.[fileName];
  if (manifest.folderNames?.[lowerFileName])
    return manifest.folderNames?.[lowerFileName];

  return 'folder';
}

function getLanguageIcon(
  fileName: string,
  lowerFileName: string,
  fileExtensions: string[]
): string | undefined {
  if (languageMapTyped.fileNames[fileName])
    return languageMapTyped.fileNames[fileName];
  if (languageMapTyped.fileNames[lowerFileName])
    return languageMapTyped.fileNames[lowerFileName];
  for (const ext of fileExtensions) {
    if (languageMapTyped.fileExtensions[ext])
      return languageMapTyped.fileExtensions[ext];
  }

  return undefined;
}

function lookForLightMatch(
  iconName: string,
  fileName: string,
  fileExtensions: string[],
  isDir: boolean,
  manifest: Manifest
): string {
  if (manifest.light?.fileNames?.[fileName] && !isDir)
    return manifest.light?.fileNames?.[fileName];
  if (manifest.light?.folderNames?.[fileName] && isDir)
    return manifest.light?.folderNames?.[fileName];

  for (const ext of fileExtensions) {
    if (manifest.light?.fileExtensions?.[ext] && !isDir)
      return manifest.light?.fileExtensions?.[ext];
  }

  return iconName;
}
