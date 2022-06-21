const providerConfig = {
  github: {
    name: 'github',
    selectors: {
      row: '.js-navigation-container[role=grid] > .js-navigation-item',
      filename: 'div[role="rowheader"] > span',
      icon: '.octicon',
    },
    getIsLightTheme: () =>
      document.querySelector('html').getAttribute('data-color-mode') === 'light',
    getIsDirectory: (svgEl) => svgEl.getAttribute('aria-label') === 'Directory',
    getIsSubmodule: (svgEl) => svgEl.getAttribute('aria-label') === 'Submodule',
    getIsSymlink: (svgEl) => svgEl.getAttribute('aria-label') === 'Symlink Directory',
    replaceIcon: (svgEl, newSVG) => {
      svgEl
        .getAttributeNames()
        .forEach((attr) => newSVG.setAttribute(attr, svgEl.getAttribute(attr)));

      svgEl.parentNode.replaceChild(newSVG, svgEl);
    },
  },
  bitbucket: {
    name: 'bitbucket',
    selectors: {
      // Don't replace the icon for the parent directory row
      row: 'table[data-qa="repository-directory"] td:first-child a:first-child:not([aria-label="Parent directory,"])',
      filename: 'span',
      icon: 'svg',
    },
    getIsLightTheme: () => true, // No dark mode available for bitbucket currently
    getIsDirectory: (svgEl) => svgEl.parentNode?.getAttribute('aria-label') === 'Directory,',
    getIsSubmodule: (svgEl) => svgEl.parentNode?.getAttribute('aria-label') === 'Submodule,',
    getIsSymlink: (svgEl) => false, // There appears to be no way to determine this for bitbucket
    replaceIcon: (svgEl, newSVG) => {
      newSVG.style.overflow = 'hidden';
      newSVG.style.pointerEvents = 'none';
      newSVG.style.maxHeight = '100%';
      newSVG.style.maxWidth = '100%';
      newSVG.style.verticalAlign = 'bottom';

      svgEl
        .getAttributeNames()
        .forEach((attr) => newSVG.setAttribute(attr, svgEl.getAttribute(attr)));

      svgEl.parentNode.replaceChild(newSVG, svgEl);
    },
  },
  azure: {
    name: 'azure',
    selectors: {
      row: 'table.bolt-table tbody > a',
      filename: 'table.bolt-table tbody > a > td[aria-colindex="1"] span.text-ellipsis',
      icon: 'td[aria-colindex="1"] span.icon-margin',
    },
    getIsLightTheme: () =>
      document.defaultView.getComputedStyle(document.body).getPropertyValue('color') ===
      'rgba(0, 0, 0, 0.9)', // TODO: There is probably a better way to determine whether Azure is in light mode
    getIsDirectory: (svgEl) => svgEl.classList.contains('repos-folder-icon'),
    getIsSubmodule: (svgEl) => false, // There appears to be no way to tell if a folder is a submodule
    getIsSymlink: (svgEl) => svgEl.classList.contains('ms-Icon--PageArrowRight'),
    replaceIcon: (svgEl, newSVG) => {
      newSVG.style.display = 'inline-flex';
      newSVG.style.height = '1rem';
      newSVG.style.width = '1rem';

      if (!svgEl.classList.contains(HIDE_PSEUDO_CLASS)) {
        svgEl.classList.add(HIDE_PSEUDO_CLASS);
      }

      // Instead of replacing the child icon, add the new icon as a child,
      // otherwise Azure DevOps crashes when you navigate through the repository
      if (svgEl.hasChildNodes()) {
        svgEl.replaceChild(newSVG, svgEl.firstChild);
      } else {
        svgEl.appendChild(newSVG);
      }
    },
  },
};

export default providerConfig;
