const giteaConfig = {
  name: 'gitea',
  selectors: {
    row: 'tr.ready.entry',
    filename: 'td.name.four.wide > span.truncate > a',
    icon: 'td.name.four.wide > span.truncate > svg',
  },
  getIsLightTheme: () => false,
  getIsDirectory: (svgEl) => svgEl.classList.contains('octicon-file-directory-fill'),
  getIsSubmodule: (svgEl) => svgEl.classList.contains('octicon-file-submodule'),
  getIsSymlink: (svgEl) => svgEl.classList.contains('octicon-file-symlink-file'),
  replaceIcon: (svgEl, newSVG) => {
    svgEl
      .getAttributeNames()
      .forEach((attr) => newSVG.setAttribute(attr, svgEl.getAttribute(attr)));

    svgEl.parentNode.replaceChild(newSVG, svgEl);
  },
  onAdd: () => {},
};

export default giteaConfig;
