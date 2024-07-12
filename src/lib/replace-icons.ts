import { observe } from 'selector-observer';
import { Provider } from '../models';
import { replaceElementWithIcon, replaceIconInRow } from './replace-icon';

export const observePage = (gitProvider: Provider, iconPack: string): void => {
  observe(gitProvider.selectors.row, {
    add(row) {
      const callback = () =>
        replaceIconInRow(row as HTMLElement, gitProvider, iconPack);
      callback();
      gitProvider.onAdd(row as HTMLElement, callback);
    },
  });
};

export const replaceAllIcons = (provider: Provider, iconPack: string) =>
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
          iconPack,
          provider
        );
    });
