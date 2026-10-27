import { syncIconMetadata } from '../lib/icon-metadata';
import { Provider } from '../models';

export default function gitlab(): Provider {
  return {
    name: 'gitlab',
    domains: [
      {
        host: 'gitlab.com',
        test: /^gitlab\.com$/,
      },
    ],
    selectors: {
      // Row in file list, file view header
      row: `table[data-testid="file-tree-table"].table.tree-table tr.tree-item,
         table[data-qa-selector="file_tree_table"] tr,
         a[data-testid="file-row"],
         a[data-track-label="file"],
         .file-header-content,
         .gl-card[data-testid="release-block"] .js-assets-list ul li`,
      // Cell in file list, file view header, readme header
      filename: `.tree-item-file-name .tree-item-link,
        .tree-item-file-name,
        span[data-testid="file-row-name-container"],
        a[data-track-label="file"] span.gl-truncate,
        .file-header-content .file-title-name,
        .file-header-content .gl-link,
        .gl-link`,
      // Any icon not contained in a button
      icon: `.tree-item-file-name .tree-item-link svg,
        .tree-item svg, .file-header-content svg:not(.gl-button-icon),
        a[data-testid="file-row"] svg,
        a[data-track-label="file"] svg,
        .gl-link svg.gl-icon[data-testid="doc-code-icon"]`,
      // Element by which to detect if the tested domain is gitlab.
      detect: 'head meta[content="GitLab"]',
    },
    canSelfHost: true,
    isCustom: false,
    getIsLightTheme: () =>
      !document.querySelector('body')?.classList.contains('gl-dark'),
    getIsDirectory: ({ icon }) =>
      ['folder-icon', 'folder-open-icon'].includes(
        icon.getAttribute('data-testid') ?? ''
      ),
    getIsSubmodule: ({ row }) =>
      row.querySelector('a')?.classList.contains('is-submodule') || false,
    getIsSymlink: ({ icon }) =>
      icon.getAttribute('data-testid') === 'symlink-icon',
    getIsExpanded: ({ row, icon }) =>
      icon.getAttribute('data-testid') === 'folder-open-icon' ||
      row.getAttribute('aria-expanded') === 'true' ||
      row.classList.contains('is-open'),
    replaceIcon: (svgEl, newSVG) => {
      const iconUrl = newSVG.getAttribute('src') ?? '';

      // Keep GitLab's SVG in place, but remove its rendered <use>. Replacing a
      // Vue-managed SVG causes duplicate icons; leaving <use> overlays both icons.
      svgEl.replaceChildren();
      svgEl.style.backgroundImage = `url("${iconUrl}")`;
      svgEl.style.backgroundPosition = 'center';
      svgEl.style.backgroundRepeat = 'no-repeat';
      svgEl.style.backgroundSize = 'contain';
      svgEl.style.color = 'transparent';
      svgEl.style.fill = 'transparent';
      svgEl.style.height = '16px';
      svgEl.style.width = '16px';
      syncIconMetadata(newSVG, svgEl);
      const colorFilterProperty = '--material-icons-extension-color-filter';
      const colorFilter = newSVG.style.getPropertyValue(colorFilterProperty);
      if (colorFilter) {
        svgEl.style.setProperty(colorFilterProperty, colorFilter);
      } else {
        svgEl.style.removeProperty(colorFilterProperty);
      }
    },
    onAdd: (row, callback) => {
      const observer = new MutationObserver((mutations) => {
        const stateChanged = mutations.some(
          (mutation) =>
            mutation.type === 'attributes' &&
            (mutation.attributeName === 'aria-expanded' ||
              mutation.attributeName === 'data-testid' ||
              mutation.attributeName === 'class')
        );
        if (!stateChanged) return;

        row
          .querySelector('[data-material-icons-extension="icon"]')
          ?.removeAttribute('data-material-icons-extension');
        callback();
      });
      observer.observe(row, {
        attributeFilter: ['aria-expanded', 'class', 'data-testid'],
        attributes: true,
        subtree: true,
      });
    },
    transformFileName: (
      rowEl: HTMLElement,
      _iconEl: HTMLElement,
      fileName: string
    ): string => {
      // file tree browser rows split the name across truncation spans, so read the clean name off the attribute instead
      const fileRowName = rowEl
        .querySelector('span[data-testid="file-row-name-container"]')
        ?.getAttribute('data-qa-file-name');
      if (fileRowName) return fileRowName;

      // try to match the 'Source code (zip)' type of rows in releases page in github.
      if (
        rowEl.parentElement?.parentElement?.classList.contains(
          'js-assets-list'
        ) &&
        fileName.includes('Source code')
      ) {
        return fileName.replace(/\s+\((.*?)\)$/, '.$1');
      }

      return fileName;
    },
  };
}
