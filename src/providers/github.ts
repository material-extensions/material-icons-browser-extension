import { Provider } from '../models';

export default function github(): Provider {
  return {
    name: 'github',
    domains: [
      {
        host: 'github.com',
        test: /^github\.com$/,
      },
    ],
    selectors: {
      row: `.js-navigation-container[role=grid] > .js-navigation-item,
        file-tree .ActionList-content,
        a.tree-browser-result,
        .PRIVATE_TreeView-item-content,
        .react-directory-filename-column,
        .Box details .Box-row`,
      filename: `div[role="rowheader"] > span,
        .ActionList-item-label,
        a.tree-browser-result > marked-text,
        .PRIVATE_TreeView-item-content > .PRIVATE_TreeView-item-content-text,
        .react-directory-filename-column a,
        a.Truncate`,
      icon: `.octicon-file,
        .octicon-file-directory-fill,
        .octicon-file-directory-open-fill,
        .octicon-file-submodule,
        .react-directory-filename-column > svg,
        .octicon-package,
        .octicon-file-zip,
        .octicon-file-diff`,
      // Element by which to detect if the tested domain is github.
      detect: 'body > div[data-turbo-body]',
    },
    canSelfHost: true,
    isCustom: false,
    getIsLightTheme: () => {
      const colorMode = document
        .querySelector('html')
        ?.getAttribute('data-color-mode');

      if (colorMode === 'light') {
        return true;
      }

      if (colorMode === 'auto') {
        return window.matchMedia('(prefers-color-scheme: light)').matches;
      }

      return false;
    },
    getIsDirectory: ({ icon }) =>
      icon.getAttribute('aria-label') === 'Directory' ||
      icon.classList.contains('octicon-file-directory-fill') ||
      icon.classList.contains('octicon-file-directory-open-fill') ||
      icon.classList.contains('icon-directory'),
    getIsSubmodule: ({ icon }) =>
      icon.getAttribute('aria-label') === 'Submodule',
    getIsSymlink: ({ icon }) =>
      icon.getAttribute('aria-label') === 'Symlink Directory',
    replaceIcon: (svgEl, newSVG) => {
      svgEl
        .getAttributeNames()
        .forEach(
          (attr) =>
            attr !== 'src' &&
            !/^data-material-icons-extension/.test(attr) &&
            newSVG.setAttribute(attr, svgEl.getAttribute(attr) ?? '')
        );

      const prevEl = svgEl.previousElementSibling;
      if (prevEl?.getAttribute('data-material-icons-extension') === 'icon') {
        newSVG.replaceWith(prevEl);
      }
      // If the icon to replace is an icon from this extension, replace it with the new icon
      else if (svgEl.getAttribute('data-material-icons-extension') === 'icon') {
        svgEl.replaceWith(newSVG);
      }
      // If neither of the above, prepend the new icon in front of the original icon.
      // If we remove the icon, GitHub code view crashes when you navigate through the
      // tree view. Instead, we just hide it via `style` attribute (not CSS class)
      // https://github.com/material-extensions/material-icons-browser-extension/pull/66
      else {
        svgEl.style.display = 'none';
        svgEl.before(newSVG);
      }
    },
    onAdd: () => {},
    transformFileName: (
      rowEl: HTMLElement,
      _iconEl: HTMLElement,
      fileName: string
    ): string => {
      // remove possible sha from submodule
      // matches 4 or more to future proof in case they decide to increase it.
      if (fileName.includes('@')) {
        return fileName.replace(/\s+@\s+[a-fA-F0-9]{4,}$/, '');
      }

      // try to match the 'Source code (zip)' type of rows in releases page in github.
      if (
        rowEl.classList.contains('Box-row') &&
        fileName.includes('Source code')
      ) {
        return fileName.replace(/\s+\((.*?)\)$/, '.$1');
      }

      return fileName;
    },
    customMappings: [
      {
        match: ({ row }) => {
          // Check all anchor tags in the row for .github/workflows
          const anchors = Array.from(row.querySelectorAll('a'));
          const hasWorkflowsHref = anchors.some((a) =>
            (a.getAttribute('href') ?? '').endsWith('.github/workflows')
          );
          // Also match if a child has class PRIVATE_TreeView-item-content-text and contains both .github/ and workflows
          const treeViewText = Array.from(
            row.querySelectorAll('.PRIVATE_TreeView-item-content-text')
          );
          const hasWorkflowsText = treeViewText.some((el) => {
            const text = el.textContent || '';
            return text.includes('.github/') && text.includes('workflows');
          });
          return Boolean(hasWorkflowsHref || hasWorkflowsText);
        },
        iconName: 'folder-gh-workflows',
      },
      {
        match: ({ row }) => {
          // Always check the closest tree view item (li) for navigation tree view
          const treeItem = row.closest('.PRIVATE_TreeView-item');
          const id = treeItem?.id || '';
          // File list fallback
          const anchor = row.querySelector('a');
          const href = anchor?.getAttribute('href');
          return Boolean(
            /^\.github\/workflows\/.*\.ya?ml-item$/.test(id) ||
              /\.github\/workflows\/.*\.ya?ml$/.test(href ?? '')
          );
        },
        iconName: 'github-actions-workflow',
      },
    ],
  };
}
