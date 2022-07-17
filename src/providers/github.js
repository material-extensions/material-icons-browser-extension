const githubConfig = {
  name: 'github',
  selectors: {
    row: '.js-navigation-container[role=grid] > .js-navigation-item, file-tree .ActionList-content, a.tree-browser-result',
    filename:
      'div[role="rowheader"] > span, .ActionList-item-label, a.tree-browser-result > marked-text',
    icon: '.octicon-file, .octicon-file-directory-fill, .octicon-file-submodule, a.tree-browser-result > svg.octicon.octicon-file',
  },
  getIsLightTheme: () => document.querySelector('html').getAttribute('data-color-mode') === 'light',
  getIsDirectory: ({ icon }) => icon.getAttribute('aria-label') === 'Directory',
  getIsSubmodule: ({ icon }) => icon.getAttribute('aria-label') === 'Submodule',
  getIsSymlink: ({ icon }) => icon.getAttribute('aria-label') === 'Symlink Directory',
  replaceIcon: (svgEl, newSVG) => {
    svgEl
      .getAttributeNames()
      .forEach((attr) => newSVG.setAttribute(attr, svgEl.getAttribute(attr)));

    svgEl.parentNode.replaceChild(newSVG, svgEl);
  },
  onAdd: () => {},
};

export default githubConfig;
