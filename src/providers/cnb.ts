import { Provider } from '../models';

export default function cnb(): Provider {
  return {
    name: 'cnb',
    domains: [
      {
        host: 'cnb.cool',
        test: /^cnb\.cool$/,
      },
    ],
    selectors: {
      // File list table row, release asset row
      row: `.cnb-file-table tbody tr,
        #asset .overflow-x-auto > div`,
      // Filename span inside the file list anchor, release asset download link
      filename: `span.ml-2,
        a[download]`,
      // The ruyi iconfont-style SVG (the first one in the row is the file icon)
      icon: `svg.ruyi-icon`,
      // Element by which to detect if the tested domain is cnb.
      detect: null,
    },
    canSelfHost: false,
    isCustom: false,
    getIsLightTheme: () => {
      // Dark mode is enabled via `class="dark"` on the <html> element.
      return !document.querySelector('html')?.classList.contains('dark');
    },
    getIsDirectory: ({ icon }) =>
      Array.from(icon.classList).some((className) =>
        className.startsWith('ruyi-icon-folder')
      ),
    getIsSubmodule: () => false,
    getIsSymlink: () => false,
    replaceIcon: (svgEl, newSVG) => {
      svgEl
        .getAttributeNames()
        .forEach(
          (attr) =>
            attr !== 'src' &&
            attr !== 'id' &&
            !/^data-material-icons-extension/.test(attr) &&
            newSVG.setAttribute(attr, svgEl.getAttribute(attr) ?? '')
        );

      newSVG.style.height = '16px';
      newSVG.style.width = '16px';

      svgEl.parentNode?.replaceChild(newSVG, svgEl);
    },
    onAdd: () => {},
    transformFileName: (
      _rowEl: HTMLElement,
      _iconEl: HTMLElement,
      fileName: string
    ) =>
      // try to match the 'Source code（zip）' type of rows in releases page.
      fileName.includes('Source code')
        ? fileName.replace(/\s*[（(](.*?)[)）]$/, '.$1')
        : fileName,
  };
}
