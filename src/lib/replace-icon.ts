import iconMap from 'material-icon-theme/dist/material-icons.json';
import Browser from 'webextension-polyfill';
import iconsList from '../icon-list.json';
import languageMap from '../language-map.json';
import { Provider } from '../models';

const iconMapTyped = iconMap as {
  fileNames: Record<string, string>;
  folderNames: Record<string, string>;
  fileExtensions: Record<string, string>;
  languageIds: Record<string, string>;
  light: {
    fileNames: Record<string, string>;
    folderNames: Record<string, string>;
    fileExtensions: Record<string, string>;
  };
};
const iconsListTyped = iconsList as Record<string, string>;
const languageMapTyped = languageMap as {
  fileExtensions: Record<string, string>;
  fileNames: Record<string, string>;
};

export function replaceIconInRow(
  itemRow: HTMLElement,
  provider: Provider,
  iconPack: string | null
): void {
  const fileName = itemRow
    .querySelector(provider.selectors.filename)
    ?.textContent?.split('/')[0]
    .trim();
  if (!fileName) return;

  const iconEl = itemRow.querySelector(
    provider.selectors.icon
  ) as HTMLElement | null;
  if (iconEl?.getAttribute('data-material-icons-extension')) return;
  if (iconEl) replaceIcon(iconEl, fileName, itemRow, provider, iconPack);
}

function replaceIcon(
  iconEl: HTMLElement,
  fileName: string,
  itemRow: HTMLElement,
  provider: Provider,
  iconPack: string | null
): void {
  const isDir = provider.getIsDirectory({ row: itemRow, icon: iconEl });
  const isSubmodule = provider.getIsSubmodule({ row: itemRow, icon: iconEl });
  const isSymlink = provider.getIsSymlink({ row: itemRow, icon: iconEl });
  const lowerFileName = fileName.toLowerCase();

  const fileExtensions: string[] = [];
  if (fileName.length <= 255) {
    for (let i = 0; i < fileName.length; i += 1) {
      if (fileName[i] === '.') fileExtensions.push(lowerFileName.slice(i + 1));
    }
  }

  let iconName = lookForMatch(
    fileName,
    lowerFileName,
    fileExtensions,
    isDir,
    isSubmodule,
    isSymlink
  );

  const isLightTheme = provider.getIsLightTheme();
  if (isLightTheme) {
    iconName = lookForLightMatch(iconName, fileName, fileExtensions, isDir);
  }

  replaceElementWithIcon(iconEl, iconName, fileName, iconPack, provider);
}

export function replaceElementWithIcon(
  iconEl: HTMLElement,
  iconName: string | undefined,
  fileName: string,
  iconPack: string | null,
  provider: Provider
): void {
  const svgFileName =
    lookForIconPackMatch(iconPack, fileName.toLowerCase()) ?? iconName;

  if (!svgFileName) return;

  const newSVG = document.createElement('img');
  newSVG.setAttribute('data-material-icons-extension', 'icon');
  newSVG.setAttribute('data-material-icons-extension-iconname', iconName ?? '');
  newSVG.setAttribute('data-material-icons-extension-filename', fileName);
  newSVG.src = Browser.runtime.getURL(`${svgFileName}.svg`);

  provider.replaceIcon(iconEl, newSVG);
}

function lookForMatch(
  fileName: string,
  lowerFileName: string,
  fileExtensions: string[],
  isDir: boolean,
  isSubmodule: boolean,
  isSymlink: boolean
): string | undefined {
  if (isSubmodule) return 'folder-git';
  if (isSymlink) return 'folder-symlink';

  if (!isDir) {
    if (iconMapTyped.fileNames[fileName])
      return iconMapTyped.fileNames[fileName];
    if (iconMapTyped.fileNames[lowerFileName])
      return iconMapTyped.fileNames[lowerFileName];

    for (const ext of fileExtensions) {
      if (iconMapTyped.fileExtensions[ext])
        return iconMapTyped.fileExtensions[ext];
      if (iconMapTyped.languageIds[ext]) return iconMapTyped.languageIds[ext];
    }

    if (languageMapTyped.fileNames[fileName])
      return languageMapTyped.fileNames[fileName];
    if (languageMapTyped.fileNames[lowerFileName])
      return languageMapTyped.fileNames[lowerFileName];
    for (const ext of fileExtensions) {
      if (languageMapTyped.fileExtensions[ext])
        return languageMapTyped.fileExtensions[ext];
    }

    return 'file';
  }

  if (iconMapTyped.folderNames[fileName])
    return iconMapTyped.folderNames[fileName];
  if (iconMapTyped.folderNames[lowerFileName])
    return iconMapTyped.folderNames[lowerFileName];

  return 'folder';
}

function lookForLightMatch(
  iconName: string | undefined,
  fileName: string,
  fileExtensions: string[],
  isDir: boolean
): string | undefined {
  if (iconMapTyped.light.fileNames[fileName] && !isDir)
    return iconMapTyped.light.fileNames[fileName];
  if (iconMapTyped.light.folderNames[fileName] && isDir)
    return iconMapTyped.light.folderNames[fileName];

  for (const ext of fileExtensions) {
    if (iconMapTyped.light.fileExtensions[ext] && !isDir)
      return iconMapTyped.light.fileExtensions[ext];
  }

  return iconName;
}

function lookForIconPackMatch(
  iconPack: string | null,
  lowerFileName: string
): string | null {
  if (!iconPack) return null;
  switch (iconPack) {
    case 'angular':
      if (iconsListTyped[`folder-angular-${lowerFileName}.svg`])
        return `folder-angular-${lowerFileName}`;
      break;
    case 'angular_ngrx':
      if (iconsListTyped[`folder-ngrx-${lowerFileName}.svg`])
        return `folder-ngrx-${lowerFileName}`;
      if (iconsListTyped[`folder-angular-${lowerFileName}.svg`])
        return `folder-angular-${lowerFileName}`;
      break;
    case 'react':
    case 'react_redux':
      if (iconsListTyped[`folder-react-${lowerFileName}.svg`])
        return `folder-react-${lowerFileName}`;
      if (iconsListTyped[`folder-redux-${lowerFileName}.svg`])
        return `folder-redux-${lowerFileName}`;
      break;
    case 'vue':
    case 'vue_vuex':
      if (iconsListTyped[`folder-vuex-${lowerFileName}.svg`])
        return `folder-vuex-${lowerFileName}`;
      if (iconsListTyped[`folder-vue-${lowerFileName}.svg`])
        return `folder-vue-${lowerFileName}`;
      if (lowerFileName === 'nuxt') return `folder-nuxt`;
      break;
    case 'nest':
      if (/\.controller\.(t|j)s$/.test(lowerFileName)) return `nest-controller`;
      if (/\.middleware\.(t|j)s$/.test(lowerFileName)) return 'nest-middleware';
      if (/\.module\.(t|j)s$/.test(lowerFileName)) return 'nest-module';
      if (/\.service\.(t|j)s$/.test(lowerFileName)) return 'nest-service';
      if (/\.decorator\.(t|j)s$/.test(lowerFileName)) return 'nest-decorator';
      if (/\.pipe\.(t|j)s$/.test(lowerFileName)) return 'nest-pipe';
      if (/\.filter\.(t|j)s$/.test(lowerFileName)) return 'nest-filter';
      if (/\.gateway\.(t|j)s$/.test(lowerFileName)) return 'nest-gateway';
      if (/\.guard\.(t|j)s$/.test(lowerFileName)) return 'nest-guard';
      if (/\.resolver\.(t|j)s$/.test(lowerFileName)) return 'nest-resolver';
      return null;
    default:
      return null;
  }
  return null;
}
