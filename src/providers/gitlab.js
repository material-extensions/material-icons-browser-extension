export default function gitlab() {
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
      row: 'table[data-testid="file-tree-table"].table.tree-table tr.tree-item, table[data-qa-selector="file_tree_table"] tr, .file-header-content',
      // Cell in file list, file view header, readme header
      filename:
        'td.tree-item-file-name .tree-item-link, td.tree-item-file-name, .file-header-content .file-title-name, .file-header-content .gl-link',
      // Any icon not contained in a button
      icon: 'td.tree-item-file-name .tree-item-link svg, .tree-item svg, .file-header-content svg:not(.gl-button-icon)',
      // Element by which to detect if the tested domain is gitlab.
      detect: 'body.page-initialized[data-page]',
    },
    canSelfHost: true,
    isCustom: false,
    getIsLightTheme: () => !document.querySelector('body').classList.contains('gl-dark'),
    getIsDirectory: ({ icon }) => icon.getAttribute('data-testid') === 'folder-icon',
    getIsSubmodule: ({ row }) =>
      row.querySelector('a')?.classList.contains('is-submodule') || false,
    getIsSymlink: ({ icon }) => icon.getAttribute('data-testid') === 'symlink-icon',
    replaceIcon: (svgEl, newSVG) => {
      svgEl
        .getAttributeNames()
        .forEach(
          (attr) =>
            attr !== 'src' &&
            !/^data-material-icons-extension/.test(attr) &&
            newSVG.setAttribute(attr, svgEl.getAttribute(attr))
        );

      newSVG.style.height = '16px';
      newSVG.style.width = '16px';

      svgEl.parentNode.replaceChild(newSVG, svgEl);
    },
    onAdd: () => {},
  };
}
