const giteaConfig = {
  name: 'gitea',
  selectors: {
    row: 'tr.ready.entry',
    filename: 'td.name.four.wide > span.truncate > a',
    icon: 'td.name.four.wide > span.truncate > svg',
  },
  getIsLightTheme: () => false, // TODO: needs further investigation
  getIsDirectory: (svgEl) => svgEl.classList.contains('octicon-file-directory-fill'),
  getIsSubmodule: () => false, // TODO: needs further investigation
  getIsSymlink: () => false, // TODO: needs further investigation
  replaceIcon: (svgEl, newSVG) => {
    svgEl
      .getAttributeNames()
      .forEach((attr) => newSVG.setAttribute(attr, svgEl.getAttribute(attr)));

    svgEl.parentNode.replaceChild(newSVG, svgEl);
  },
  onAdd: () => {},
};

export default giteaConfig;
