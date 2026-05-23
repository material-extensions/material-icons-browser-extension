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
        .octicon-file-diff,
        .octicon-file-added,
        .octicon-file-moved,
        .octicon-file-removed`,
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
      icon.classList.contains('octicon-file-submodule'),
    getIsSymlink: ({ icon }) =>
      icon.classList.contains('octicon-file-symlink-file'),
    getIsExpanded: ({ icon }) =>
      icon.classList.contains('octicon-file-directory-open-fill'),
    replaceIcon: (svgEl, newSVG) => {
      const iconUrl = newSVG.getAttribute('src') ?? '';
      const iconName =
        newSVG.getAttribute('data-material-icons-extension-iconname') ?? '';
      const fileName =
        newSVG.getAttribute('data-material-icons-extension-filename') ?? '';

      // Clear the SVG's internal paths/shapes so nothing renders on top
      // of our background icon. This keeps the original element in the DOM
      // (avoiding GitHub SPA crashes) while visually replacing its content.
      svgEl.innerHTML = '';

      // Apply the material icon as a background image on the existing SVG.
      // This avoids adding new elements, copying classes, or conflicting
      // with other extensions like Refined GitHub.
      // https://github.com/material-extensions/material-icons-browser-extension/issues/65#issuecomment-1538427263
      // https://github.com/material-extensions/material-icons-browser-extension/issues/142
      svgEl.style.backgroundImage = `url("${iconUrl}")`;
      svgEl.style.backgroundSize = 'contain';
      svgEl.style.backgroundRepeat = 'no-repeat';
      svgEl.style.backgroundPosition = 'center';
      svgEl.style.display = '';

      // Mark as replaced by this extension
      svgEl.setAttribute('data-material-icons-extension', 'icon');
      svgEl.setAttribute('data-material-icons-extension-iconname', iconName);
      svgEl.setAttribute('data-material-icons-extension-filename', fileName);

      // Get the fgColor-* class from the original svg element
      // and apply it to the link next to the icon.
      const fgColorClass = Array.from(svgEl.classList).find((className) =>
        className.startsWith('fgColor-')
      );
      // The fgColor-muted is the same as the fgColor-default,
      // so we don't need to copy that class.
      if (fgColorClass && fgColorClass !== 'fgColor-muted') {
        const link =
          svgEl.parentElement?.nextElementSibling?.querySelector('a');
        if (link) {
          link.classList.add(fgColorClass);
        }
      }
    },
    onAdd: (row, callback) => {
      // GitHub's React tree view re-renders folder icons when expanding/collapsing,
      // replacing the SVG element entirely. The selector-observer won't fire again
      // for the same row, so we use a MutationObserver to detect these changes.
      const observer = new MutationObserver((mutationsList) => {
        // Only re-run if a new SVG was added (GitHub swapping the icon),
        // not when we modify the existing SVG (setting background-image, attributes).
        const isNewSvgAdded = mutationsList.some((mutation) =>
          Array.from(mutation.addedNodes).some(
            (node) =>
              node.nodeName === 'svg' &&
              !(node as Element).hasAttribute('data-material-icons-extension')
          )
        );

        if (isNewSvgAdded) {
          callback();
        }
      });
      observer.observe(row, {
        childList: true,
        subtree: true,
      });
    },
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
