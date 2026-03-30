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
      // Repo root uses #file-tree with grid-cols-3, subfolders use .tree with grid-cols-12,
      // PR file tree uses .tree-file for files and .tree-directory (inside summary) for folders
      row: `#file-tree .grid.grid-cols-3,
        .tree .grid.grid-cols-12,
        .tree-file,
        .tree-directory`,
      filename: '.truncate',
      icon: 'svg',
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
    getIsDirectory: ({ row, icon }) =>
      // Repo file tree: folder SVGs have fill-current class
      icon.classList.contains('fill-current') ||
      // PR file tree: folder entries use .tree-directory
      row.classList.contains('tree-directory') ||
      // Fallback: check for folder SVG path
      icon.querySelector('path[d*="M20 20a2"]') !== null,
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

      // PR file tree folders: the closed-folder SVG has group-open/level-N:hidden
      // which hides it when <details> is open. Remove those classes so our icon
      // stays visible regardless of open/closed state.
      newSVG.className = newSVG.className
        .split(' ')
        .filter((c: string) => !c.startsWith('group-open/') && c !== 'hidden')
        .join(' ');

      // In PR file tree, folders have two SVGs (open/closed state).
      // Hide the sibling SVG so only our icon shows.
      const sibling = svgEl.nextElementSibling;
      if (
        sibling &&
        sibling.tagName.toLowerCase() === 'svg' &&
        !sibling.hasAttribute('data-material-icons-extension')
      ) {
        (sibling as HTMLElement).style.display = 'none';
      }

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
