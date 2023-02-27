const githubConfig = {
  domain: 'github.com',
  selectors: {
    row: `.js-navigation-container[role=grid] > .js-navigation-item,
      file-tree .ActionList-content,
      a.tree-browser-result,
      .PRIVATE_TreeView-item-content,
      .react-directory-filename-column`,
    filename: `div[role="rowheader"] > span,
      .ActionList-item-label,
      a.tree-browser-result > marked-text,
      .PRIVATE_TreeView-item-content > .PRIVATE_TreeView-item-content-text,
      .react-directory-filename-column h3`,
    icon: `.octicon-file,
      .octicon-file-directory-fill,
      .octicon-file-directory-open-fill,
      .octicon-file-submodule,
      .react-directory-filename-column > svg`,
  },
  getIsLightTheme: () => document.querySelector('html').getAttribute('data-color-mode') === 'light',
  getIsDirectory: ({ icon }) =>
    icon.getAttribute('aria-label') === 'Directory' ||
    icon.classList.contains('octicon-file-directory-fill') ||
    icon.classList.contains('octicon-file-directory-open-fill') ||
    icon.classList.contains('icon-directory'),
  getIsSubmodule: ({ icon }) => icon.getAttribute('aria-label') === 'Submodule',
  getIsSymlink: ({ icon }) => icon.getAttribute('aria-label') === 'Symlink Directory',
  replaceIcon: (svgEl, newSVG) => {
    newSVG.style.height = '1rem';
    newSVG.style.width = '1rem';
    newSVG.style.verticalAlign = 'text-bottom';
    newSVG.style.userSelect = 'none';

    // Instead of replacing the icon, add the new icon as a previous sibling,
    // otherwise the GitHub code view crashes when you navigate through the
    // tree view
    const prevEl = svgEl.previousElementSibling;
    if (prevEl?.getAttribute('data-material-icons-extension') === 'icon') {
      svgEl.parentNode.replaceChild(newSVG, prevEl);
    } else {
      svgEl.parentNode.insertBefore(newSVG, svgEl);
    }
  },
  onAdd: () => {},
};

export default githubConfig;
