const bitbucketConfig = {
  domain: 'bitbucket.org',
  selectors: {
    // Don't replace the icon for the parent directory row
    row: 'table[data-qa="repository-directory"] td:first-child a:first-child:not([aria-label="Parent directory,"])',
    filename: 'span',
    icon: 'svg',
  },
  getIsLightTheme: () => true, // No dark mode available for bitbucket currently
  getIsDirectory: ({ icon }) => icon.parentNode?.getAttribute('aria-label') === 'Directory,',
  getIsSubmodule: ({ icon }) => icon.parentNode?.getAttribute('aria-label') === 'Submodule,',
  getIsSymlink: () => false, // There appears to be no way to determine this for bitbucket
  replaceIcon: (svgEl, newSVG) => {
    newSVG.style.overflow = 'hidden';
    newSVG.style.pointerEvents = 'none';
    newSVG.style.maxHeight = '100%';
    newSVG.style.maxWidth = '100%';
    newSVG.style.verticalAlign = 'bottom';

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

export default bitbucketConfig;
