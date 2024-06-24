export default function gitea() {
  return {
    name: 'gitea',
    domains: [
      {
        host: 'gitea.com',
        test: /^gitea\.com$/,
      },
    ],
    selectors: {
      row: 'tr.ready.entry',
      filename: 'td.name.four.wide > span.truncate > a',
      icon: 'td.name.four.wide > span.truncate > svg',
      // Element by which to detect if the tested domain is gitea.
      detect: 'body > .full.height > .page-content[role=main]',
    },
    canSelfHost: true,
    isCustom: false,
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
}
