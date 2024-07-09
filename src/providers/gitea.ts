import { Provider } from '../models';

export default function gitea(): Provider {
  return {
    name: 'gitea',
    domains: [
      {
        host: 'gitea.com',
        test: /^gitea\.com$/,
      },
    ],
    selectors: {
      row: 'tr.ready.entry, details.download ul.list li',
      filename:
        'td.name.four.wide > span.truncate > a, a[download] strong, a.archive-link strong',
      icon: 'td.name.four.wide > span.truncate > svg, .octicon-package, .octicon-file-zip',
      // Element by which to detect if the tested domain is gitea.
      detect: 'body > .full.height > .page-content[role=main]',
    },
    canSelfHost: true,
    isCustom: false,
    getIsLightTheme: () => false,
    getIsDirectory: ({ icon }) =>
      icon.classList.contains('octicon-file-directory-fill'),
    getIsSubmodule: ({ icon }) =>
      icon.classList.contains('octicon-file-submodule'),
    getIsSymlink: ({ icon }) =>
      icon.classList.contains('octicon-file-symlink-file'),
    replaceIcon: (svgEl, newSVG) => {
      svgEl
        .getAttributeNames()
        .forEach(
          (attr) =>
            attr !== 'src' &&
            !/^data-material-icons-extension/.test(attr) &&
            newSVG.setAttribute(attr, svgEl.getAttribute(attr) ?? '')
        );

      svgEl.parentNode?.replaceChild(newSVG, svgEl);
    },
    onAdd: () => {},
    transformFileName: (
      rowEl: HTMLElement,
      _iconEl: HTMLElement,
      fileName: string
    ): string => {
      // try to match the 'Source code (zip)' type of rows in releases page in github.
      if (
        rowEl.querySelector('.archive-link') &&
        fileName.includes('Source code')
      ) {
        return fileName.replace(/\s+\((.*?)\)$/, '.$1');
      }

      return fileName;
    },
  };
}
