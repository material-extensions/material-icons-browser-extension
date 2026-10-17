import {
  generateManifest,
  IconAssociations,
  IconPackValue,
} from 'material-icon-theme';
import { Provider } from '../models';
import { FolderTheme } from './folder-theme';
import { replaceElementWithIcon, replaceIconInRow } from './replace-icon';

export type RuntimeIconSettings = {
  folderColor?: string;
  fileColor?: string;
  folderTheme: FolderTheme;
};

export type IconSettingsController = {
  setSettings: (settings: RuntimeIconSettings) => void;
};

export const observePage = (
  gitProvider: Provider,
  iconPack: IconPackValue,
  fileBindings?: IconAssociations,
  folderBindings?: IconAssociations,
  folderColor?: string,
  fileColor?: string,
  folderTheme: FolderTheme = 'specific'
): IconSettingsController => {
  const manifest = generateManifest({
    activeIconPack: iconPack || undefined,
    files: { associations: fileBindings },
    folders: { associations: folderBindings },
  });
  const rowsWithAddHandler = new WeakSet<Element>();
  let activeSettings: RuntimeIconSettings = {
    folderColor,
    fileColor,
    folderTheme,
  };

  const replaceRow = (row: Element) => {
    const callback = () =>
      replaceIconInRow(
        row as HTMLElement,
        gitProvider,
        manifest,
        activeSettings.folderColor,
        activeSettings.fileColor,
        activeSettings.folderTheme
      );

    callback();

    if (!rowsWithAddHandler.has(row)) {
      rowsWithAddHandler.add(row);
      gitProvider.onAdd(row as HTMLElement, callback);
    }
  };

  const processNode = (node: Node) => {
    if (!(node instanceof Element)) return;
    if (node.hasAttribute('data-material-icons-extension')) return;

    const closestRow = node.closest(gitProvider.selectors.row);
    if (closestRow) replaceRow(closestRow);
    node.querySelectorAll(gitProvider.selectors.row).forEach(replaceRow);
  };

  document.querySelectorAll(gitProvider.selectors.row).forEach(replaceRow);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') processNode(mutation.target);
      for (const node of mutation.addedNodes) processNode(node);
    }
  });

  observer.observe(document.documentElement ?? document, {
    attributeFilter: ['class', 'id', 'role'],
    attributes: true,
    childList: true,
    subtree: true,
  });

  return {
    setSettings: (settings) => {
      activeSettings = settings;
    },
  };
};

export const replaceAllIcons = (
  provider: Provider,
  settings: RuntimeIconSettings = { folderTheme: 'specific' }
) => {
  document
    .querySelectorAll('[data-material-icons-extension-iconname]')
    .forEach((iconEl) => {
      const currentIconName = iconEl.getAttribute(
        'data-material-icons-extension-iconname'
      );
      if (!currentIconName) return;

      const fileName =
        iconEl.getAttribute('data-material-icons-extension-filename') ?? '';
      const isDirectory = iconEl.hasAttribute(
        'data-material-icons-extension-directory'
      );
      const specificIconName =
        iconEl.getAttribute(
          'data-material-icons-extension-specific-iconname'
        ) ?? currentIconName;
      const isExpanded =
        iconEl.getAttribute('data-material-icons-extension-expanded') ===
        'true';
      const isSpecialFolder =
        iconEl.getAttribute('data-material-icons-extension-special-folder') ===
        'true';
      let iconName = currentIconName;

      if (isDirectory) {
        iconName =
          settings.folderTheme === 'classic' && !isSpecialFolder
            ? isExpanded
              ? 'folder-open.svg'
              : 'folder.svg'
            : specificIconName;
      }

      replaceElementWithIcon(
        iconEl as HTMLElement,
        iconName,
        fileName,
        provider,
        settings.folderColor,
        settings.fileColor,
        isDirectory
          ? {
              specificIconName,
              isExpanded,
              isSpecialFolder,
            }
          : undefined
      );
    });
};
