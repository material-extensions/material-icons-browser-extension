import { observe } from 'selector-observer';
import { Provider } from '../models';
import { replaceElementWithIcon, replaceIconInRow } from './replace-icon';

let executions = 0;
let timerID: ReturnType<typeof setTimeout> | null = null;

const rushFirst = (rushBatch: number, callback: () => void): void => {
  if (executions <= rushBatch) {
    callback();
    setTimeout(callback, 20);
    executions += 1;
  } else {
    setTimeout(callback, 0);
    if (timerID !== null) {
      clearTimeout(timerID);
    }
    timerID = setTimeout(() => {
      executions = 0;
    }, 1000);
  }
};

export const observePage = (gitProvider: Provider, iconPack: string): void => {
  observe(gitProvider.selectors.row, {
    add(row) {
      const callback = () =>
        replaceIconInRow(row as HTMLElement, gitProvider, iconPack);
      rushFirst(90, callback);
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
