const giteaConfig = {
  domain: 'gitea.com',
  selectors: {
    row: 'tr.ready.entry',
    filename: 'td.name.four.wide > span.truncate > a',
    icon: 'td.name.four.wide > span.truncate > svg',
  },
  getIsLightTheme: () => false,
  getIsDirectory: ({ icon }) => icon.classList.contains('octicon-file-directory-fill'),
  getIsSubmodule: ({ icon }) => icon.classList.contains('octicon-file-submodule'),
  getIsSymlink: ({ icon }) => icon.classList.contains('octicon-file-symlink-file'),
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

export default giteaConfig;
