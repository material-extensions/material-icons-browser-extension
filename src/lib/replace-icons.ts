import { generateManifest } from 'material-icon-theme';
import { observe } from 'selector-observer';
import { Provider } from '../models';
import { replaceElementWithIcon, replaceIconInRow } from './replace-icon';

export const observePage = (gitProvider: Provider, iconPack: string): void => {
  const manifest = generateManifest({
    activeIconPack: iconPack ?? undefined,
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
