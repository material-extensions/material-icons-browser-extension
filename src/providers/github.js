const githubConfig = {
  domain: 'github.com',
  selectors: {
    row: '.js-navigation-container[role=grid] > .js-navigation-item, file-tree .ActionList-content, a.tree-browser-result, tr.react-directory-row, div.PRIVATE_TreeView-item-content',
    filename:
      'div[role="rowheader"] > span, .ActionList-item-label, a.tree-browser-result > marked-text, .react-directory-truncate, .PRIVATE_TreeView-item-content-text',
    icon: '.octicon-file, .octicon-file-directory-fill, .octicon-file-submodule, a.tree-browser-result > svg.octicon.octicon-file, .react-directory-filename-column svg, .PRIVATE_TreeView-directory-icon > svg.octicon, .PRIVATE_TreeView-item-visual > svg.octicon',
  },
  getIsLightTheme: () => document.querySelector('html').getAttribute('data-color-mode') === 'light',
  getIsDirectory: ({ icon }) => icon.getAttribute('aria-label') === 'Directory' || icon.getAttribute('class')?.includes('directory'),
  getIsSubmodule: ({ icon, row }) => icon.getAttribute('aria-label') === 'Submodule' || row.querySelector('.react-directory-filename-column .sr-only')?.innerText === '(Submodule)',
  getIsSymlink: ({ icon, row }) => icon.getAttribute('aria-label') === 'Symlink Directory' || row.querySelector('.react-directory-filename-column .sr-only')?.innerText === '(Symlink to file)',
  replaceIcon: (svgEl, newSVG) => {
    svgEl
      .getAttributeNames()
      .forEach(
        (attr) =>
          attr !== 'src' &&
          !/^data-material-icons-extension/.test(attr) &&
          newSVG.setAttribute(attr, svgEl.getAttribute(attr))
      );

    svgEl.parentNode.replaceChild(newSVG, svgEl);
  },
  onAdd: () => {},
};

export default githubConfig;
