import { Provider } from '../models';

export default function gitee(): Provider {
  return {
    name: 'gitee',
    domains: [
      {
        host: 'gitee.com',
        test: /^gitee\.com$/,
      },
    ],
    selectors: {
      // File list row, README header, file view header
      row: `#git-project-content .tree-content .row.tree-item,
        .file_title,
        .blob-description,
        .release-body .releases-download-list .item`,
      // File name table cell, Submodule name table cell, file view header
      filename: `.tree-list-item > a,
        .tree-item-submodule-name a,
        span.file_name,
        a`,
      // The iconfont icon not including the delete button icon in the file view header
      icon: 'i.iconfont:not(.icon-delete), i.icon',
      // Element by which to detect if the tested domain is gitee.
      detect: null,
    },
    canSelfHost: false,
    isCustom: false,
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
            newSVG.setAttribute(attr, svgEl.getAttribute(attr) ?? '')
        );

      newSVG.style.height = '28px';
      newSVG.style.width = '18px';

      svgEl.parentNode?.replaceChild(newSVG, svgEl);
    },
    onAdd: () => {},
    transformFileName: (
      rowEl: HTMLElement,
      _iconEl: HTMLElement,
      fileName: string
    ): string => {
      // try to match the 'Source code (zip)' type of rows in releases page in github.
      if (
        rowEl.classList.contains('item') &&
        fileName.includes('Source code')
      ) {
        return fileName.replace(/\s+\((.*?)\)$/, '.$1');
      }

      return fileName;
    },
  };
}
