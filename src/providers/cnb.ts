import { Provider } from '../models';

// CSS-module hashes change between CNB builds; the component prefix is stable.
const treeRow = ':is(div, a)[class*="directory_tree-item__"]';
const treeFilename = `${treeRow} > div > span.truncate`;
const treeChevron = 'svg[class*="ruyi-icon-chevron-"]';

export default function cnb(): Provider {
  return {
    name: 'cnb',
    domains: [
      {
        host: 'cnb.cool',
        test: /^cnb\.cool$/,
      },
    ],
    selectors: {
      // Repository file list, release assets, and virtualized commit/diff tree.
      row: `.cnb-file-table tbody tr,
        #asset .overflow-x-auto > div,
        ${treeRow}`,
      filename: `span.ml-2,
        a[download],
        ${treeFilename}`,
      // Tree rows have no file icons: use the label as an insertion anchor.
      // Keep the original chevron intact so its click handler still works.
      icon: `svg.ruyi-icon:not([class*="ruyi-icon-chevron-"]),
        [data-cnb-tree-icon],
        ${treeFilename}`,
      // Element by which to detect if the tested domain is cnb.
      detect: null,
    },
    canSelfHost: false,
    isCustom: false,
    getIsLightTheme: () => {
      // Dark mode is enabled via `class="dark"` on the <html> element.
      return !document.querySelector('html')?.classList.contains('dark');
    },
    getIsDirectory: ({ row, icon }) =>
      (row.matches(treeRow) && !!row.querySelector(treeChevron)) ||
      Array.from(icon.classList).some((className) =>
        className.startsWith('ruyi-icon-folder')
      ),
    getIsExpanded: ({ row }) =>
      row.matches(treeRow) && !!row.querySelector('svg.ruyi-icon-chevron-down'),
    getIsSubmodule: () => false,
    getIsSymlink: () => false,
    replaceIcon: (svgEl, newSVG) => {
      if (
        svgEl.matches(treeFilename) ||
        svgEl.hasAttribute('data-cnb-tree-icon')
      ) {
        newSVG.setAttribute('data-cnb-tree-icon', '');
        newSVG.style.height = '16px';
        newSVG.style.width = '16px';
        newSVG.style.flexShrink = '0';
        newSVG.style.marginRight = '4px';
        if (svgEl.hasAttribute('data-cnb-tree-icon')) {
          svgEl.replaceWith(newSVG);
        } else {
          svgEl.style.flex = '1';
          svgEl.style.minWidth = '0';
          svgEl.before(newSVG);
        }
        return;
      }

      svgEl
        .getAttributeNames()
        .forEach(
          (attr) =>
            attr !== 'src' &&
            attr !== 'id' &&
            !/^data-material-icons-extension/.test(attr) &&
            newSVG.setAttribute(attr, svgEl.getAttribute(attr) ?? '')
        );

      newSVG.style.height = '16px';
      newSVG.style.width = '16px';

      svgEl.parentNode?.replaceChild(newSVG, svgEl);
    },
    onAdd: (row, callback) => {
      if (!row.matches(treeRow)) return;

      // Virtualized rows can be reused for a different file or folder state.
      const getState = () =>
        JSON.stringify([
          row.querySelector(treeFilename)?.textContent,
          row.querySelector(treeChevron)?.getAttribute('class'),
        ]);
      let state = getState();
      const observer = new MutationObserver(() => {
        const nextState = getState();
        if (nextState === state) return;
        state = nextState;
        row.querySelector('[data-cnb-tree-icon]')?.remove();
        callback();
      });
      observer.observe(row, {
        attributes: true,
        attributeFilter: ['class'],
        childList: true,
        characterData: true,
        subtree: true,
      });
    },
    transformFileName: (
      _rowEl: HTMLElement,
      _iconEl: HTMLElement,
      fileName: string
    ) =>
      // try to match the 'Source code（zip）' type of rows in releases page.
      fileName.includes('Source code')
        ? fileName.replace(/\s*[（(](.*?)[)）]$/, '.$1')
        : fileName,
  };
}
