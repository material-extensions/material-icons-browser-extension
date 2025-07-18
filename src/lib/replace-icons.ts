import {
  generateManifest,
  IconAssociations,
  IconPackValue,
} from 'material-icon-theme';
import { observe } from 'selector-observer';
import { Provider } from '../models';
import { replaceElementWithIcon, replaceIconInRow } from './replace-icon';

export const observePage = (
  gitProvider: Provider,
  iconPack: IconPackValue,
  fileBindings?: IconAssociations,
  folderBindings?: IconAssociations,
  languageBindings?: IconAssociations
): void => {
  const manifest = generateManifest({
    activeIconPack: iconPack || undefined,
    files: { associations: fileBindings },
    folders: { associations: folderBindings },
    languages: {
      associations: languageBindings,
    },
  });

  observe(gitProvider.selectors.row, {
    add(row) {
      const callback = () =>
        replaceIconInRow(row as HTMLElement, gitProvider, manifest);
      callback();
      gitProvider.onAdd(row as HTMLElement, callback);
    },
  });
};

export const replaceAllIcons = (provider: Provider) => {
  document
    .querySelectorAll('img[data-material-icons-extension-iconname]')
    .forEach((iconEl) => {
      const iconName = iconEl.getAttribute(
        'data-material-icons-extension-iconname'
      );
      const fileName =
        iconEl.getAttribute('data-material-icons-extension-filename') ?? '';
      if (iconName)
        replaceElementWithIcon(
          iconEl as HTMLElement,
          iconName,
          fileName,
          provider
        );
    });
};
