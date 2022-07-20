const giteeConfig = {
  domain: 'gitee.com',
  selectors: {
    // File list row, README header, file view header
    row: '#git-project-content .tree-content .row.tree-item, .file_title, .blob-description',
    // File name table cell, Submodule name table cell, file view header
    filename: '.tree-list-item > a, .tree-item-submodule-name a, span.file_name',
    // The iconfont icon not including the delete button icon in the file view header
    icon: 'i.iconfont:not(.icon-delete)',
  },
  getIsLightTheme: () => true, // There appears to be no dark theme available for gitee.
  getIsDirectory: ({ icon }) => icon.classList.contains('icon-folders'),
  getIsSubmodule: ({ icon }) => icon.classList.contains('icon-submodule'),
  getIsSymlink: ({ icon }) => icon.classList.contains('icon-file-shortcut'),
  replaceIcon: (svgEl, newSVG) => {
    svgEl
      .getAttributeNames()
      .forEach(
        (attr) =>
          attr !== 'src' &&
          !/^data-material-icons-extension/.test(attr) &&
          newSVG.setAttribute(attr, svgEl.getAttribute(attr))
      );

    newSVG.style.height = '28px';
    newSVG.style.width = '18px';

    svgEl.parentNode.replaceChild(newSVG, svgEl);
  },
  onAdd: () => {},
};

export default giteeConfig;
