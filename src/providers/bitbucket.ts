import { Provider } from '../models';

export default function bitbucket(): Provider {
  return {
    name: 'bitbucket',
    domains: [
      {
        host: 'bitbucket.org',
        test: /^bitbucket\.org$/,
      },
    ],
    selectors: {
      row: 'table[data-qa="repository-directory"] td:first-child a:first-child, #file-tree li > a[href^="#chg-"], #file-tree li > button[aria-expanded]',
      filename: ':scope > span[role="presentation"], span',
      icon: 'svg:not([data-material-icons-extension-chevron]), img[data-material-icons-extension-iconname]',
      // Element by which to detect if the tested domain is bitbucket.
      detect: 'body[data-aui-version] > #root',
    },
    canSelfHost: true,
    isCustom: false,
    getIsLightTheme: () => true, // No dark mode available for bitbucket currently
    getIsDirectory: ({ icon }) =>
      /^(?:Directory(?:,|$)|Parent directory(?:,|$))/.test(
        icon.closest('[aria-label]')?.getAttribute('aria-label') ?? ''
      ),
    getIsSubmodule: ({ icon }) =>
      icon
        .closest('[aria-label]')
        ?.getAttribute('aria-label')
        ?.startsWith('Submodule,') ?? false,
    getIsExpanded: ({ row }) => row.getAttribute('aria-expanded') === 'true',
    getIsSymlink: () => false, // There appears to be no way to determine this for bitbucket
    replaceIcon: (svgEl, newSVG) => {
      const isDirectory = svgEl
        .closest('[aria-label]')
        ?.getAttribute('aria-label')
        ?.startsWith('Directory,');
      const iconWrapper = svgEl.parentElement;
      const tile = iconWrapper?.parentElement;

      newSVG.style.overflow = 'hidden';
      newSVG.style.pointerEvents = 'none';
      newSVG.style.maxHeight = '100%';
      newSVG.style.maxWidth = '100%';
      newSVG.style.verticalAlign = 'bottom';

      svgEl
        .getAttributeNames()
        .forEach(
          (attr) =>
            attr !== 'src' &&
            !/^data-material-icons-extension/.test(attr) &&
            newSVG.setAttribute(attr, svgEl.getAttribute(attr) ?? '')
        );

      // Bitbucket uses different inner sizes for file and folder icons. Size
      // both the image and its wrapper so max-width/max-height cannot shrink it.
      newSVG.style.width = '20px';
      newSVG.style.height = '20px';
      if (iconWrapper?.getAttribute('aria-hidden') === 'true') {
        iconWrapper.style.width = '20px';
        iconWrapper.style.height = '20px';
      }

      // Keep the directory tile's footprint, but remove its decoration.
      if (
        isDirectory &&
        iconWrapper?.getAttribute('aria-hidden') === 'true' &&
        tile?.tagName === 'SPAN' &&
        tile.childElementCount === 1
      ) {
        tile.style.background = 'transparent';
        tile.style.boxShadow = 'none';
        tile.style.borderRadius = '0';
      }

      const treeDirectory = svgEl.closest('#file-tree button[aria-expanded]');
      if (treeDirectory && iconWrapper) {
        // Retain the native disclosure chevron as well as the folder icon.
        if (
          !iconWrapper.querySelector('[data-material-icons-extension-chevron]')
        ) {
          const chevron = svgEl.cloneNode(true) as HTMLElement;
          chevron.setAttribute('data-material-icons-extension-chevron', '');
          chevron.style.width = '16px';
          chevron.style.height = '16px';
          chevron.style.flexShrink = '0';
          iconWrapper.insertBefore(chevron, svgEl);
        }
        iconWrapper.style.display = 'inline-flex';
        iconWrapper.style.alignItems = 'center';
        iconWrapper.style.gap = '4px';
        iconWrapper.style.width = '40px';
        iconWrapper.style.height = '20px';
        newSVG.style.flexShrink = '0';
      }

      svgEl.parentNode?.replaceChild(newSVG, svgEl);
    },
    onAdd: (row, callback) => {
      if (!row.matches('#file-tree button[aria-expanded]')) return;
      new MutationObserver(() => {
        row
          .querySelector('img[data-material-icons-extension-iconname]')
          ?.removeAttribute('data-material-icons-extension');
        callback();
      }).observe(row, { attributes: true, attributeFilter: ['aria-expanded'] });
    },
    transformFileName: (
      rowEl: HTMLElement,
      _iconEl: HTMLElement,
      fileName: string
    ): string => {
      if (rowEl.closest('#file-tree')) {
        return (
          rowEl
            .querySelector(':scope > span[role="presentation"]')
            ?.textContent?.trim()
            .split('/')
            .pop() ?? fileName
        );
      }
      return fileName;
    },
  };
}
