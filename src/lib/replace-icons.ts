import {
  generateManifest,
  IconAssociations,
  IconPackValue,
} from 'material-icon-theme';
import { Provider } from '../models';
import { replaceElementWithIcon, replaceIconInRow } from './replace-icon';

export const observePage = (
  gitProvider: Provider,
  iconPack: IconPackValue,
  fileBindings?: IconAssociations,
  folderBindings?: IconAssociations
): void => {
  const manifest = generateManifest({
    activeIconPack: iconPack || undefined,
    files: { associations: fileBindings },
    folders: { associations: folderBindings },
  });
  const rowsWithAddHandler = new WeakSet<Element>();

  const replaceRow = (row: Element) => {
    const callback = () =>
      replaceIconInRow(row as HTMLElement, gitProvider, manifest);

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
    if (closestRow) {
      replaceRow(closestRow);
    }

    node.querySelectorAll(gitProvider.selectors.row).forEach(replaceRow);
  };

  document.querySelectorAll(gitProvider.selectors.row).forEach(replaceRow);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') {
        processNode(mutation.target);
      }

      for (const node of mutation.addedNodes) {
        processNode(node);
      }
    }
  });

  observer.observe(document.documentElement ?? document, {
    attributeFilter: ['class', 'id', 'role'],
    attributes: true,
    childList: true,
    subtree: true,
  });
};

export const replaceAllIcons = (provider: Provider) => {
  document
    .querySelectorAll('[data-material-icons-extension-iconname]')
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
