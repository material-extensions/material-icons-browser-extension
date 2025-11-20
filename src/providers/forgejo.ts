import { Provider } from '../models';

export default function forgejo(): Provider {
  return {
    name: 'forgejo',
    domains: [
      {
        host: 'codeberg.org',
        test: /^codeberg\.org$/,
      },
    ],
    selectors: {
      // Primary Forgejo structure + a fallback for older Gitea-like markup
      row: '#repo-files-table .entry, #repo-files-table .repo-file-item',
      filename: '.name a, .repo-file-cell.name a',
      icon: '.name svg, .repo-file-cell.name svg',
      // Element by which to detect if the tested domain is forgejs.
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
