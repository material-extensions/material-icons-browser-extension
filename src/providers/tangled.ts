import { Provider } from '../models';

export default function tangled(): Provider {
  return {
    name: 'tangled',
    domains: [
      {
        host: 'tangled.org',
        test: /^tangled\.org$/,
      },
    ],
    selectors: {
      // Repo root uses #file-tree with grid-cols-3, subfolders use .tree with grid-cols-12
      row: `#file-tree .grid.grid-cols-3,
        .tree .grid.grid-cols-12`,
      filename: 'a .truncate',
      icon: 'a svg',
      detect: 'meta[name="htmx-config"]',
    },
    canSelfHost: false,
    isCustom: false,
    getIsLightTheme: () => {
      const html = document.querySelector('html');
      // Tangled uses dark mode by default with dark: classes.
      // Check if the html element has a light theme indicator or media preference.
      if (html?.classList.contains('dark')) {
        return false;
      }

      return !window.matchMedia('(prefers-color-scheme: dark)').matches;
    },
    getIsDirectory: ({ icon }) =>
      icon.querySelector('path[d*="M20 20a2"]') !== null ||
      icon.classList.contains('fill-current'),
    getIsSubmodule: () => false,
    getIsSymlink: () => false,
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
      _rowEl: HTMLElement,
      _iconEl: HTMLElement,
      fileName: string
    ): string => fileName,
  };
}
