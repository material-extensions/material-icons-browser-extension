const githubConfig = {
  name: 'github',
  selectors: {
    row: '.js-navigation-container[role=grid] > .js-navigation-item, file-tree .ActionList-content',
    filename: 'div[role="rowheader"] > span, .ActionList-item-label',
    icon: '.octicon-file, .octicon-file-directory-fill',
  },
  getIsLightTheme: () => document.querySelector('html').getAttribute('data-color-mode') === 'light',
  getIsDirectory: (svgEl) => svgEl.getAttribute('aria-label') === 'Directory',
  getIsSubmodule: (svgEl) => svgEl.getAttribute('aria-label') === 'Submodule',
  getIsSymlink: (svgEl) => svgEl.getAttribute('aria-label') === 'Symlink Directory',
  replaceIcon: (svgEl, newSVG) => {
    svgEl
      .getAttributeNames()
      .forEach((attr) => newSVG.setAttribute(attr, svgEl.getAttribute(attr)));

    svgEl.parentNode.replaceChild(newSVG, svgEl);
  },
  onAdd: () => {},
};

export default githubConfig;
