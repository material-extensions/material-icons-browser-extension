import { observe } from 'selector-observer';
import iconsCache from './icon-cache';
import iconMap from './icon-map';
import languageMap from './language-map';

// run on load
const iconSelector = '.js-navigation-container > .js-navigation-item';

observe(iconSelector, {
  add(row) {
    replaceIcon(row, iconMap);
  },
});

function replaceIcon(fileRow, iconMap) {
  // get file/folder name
  const fileName = fileRow.querySelector('[role=rowheader]')?.firstElementChild?.firstElementChild
    ?.innerText;
  if (!fileName) return; // fileName couldn't be found or we don't have a match for it

  // svg to be replaced
  const svgEl = fileRow.querySelector('.octicon');
  if (!svgEl) return; // couldn't find svg element

  // get type. Directory or File
  const isDir = svgEl.getAttribute('aria-label') === 'Directory';

  // get icon filename
  const iconName = lookForMatch(fileName, isDir, iconMap); // returns iconname if found or undefined
  if (!iconName) return;

  const { innerHtml, viewBox } = iconsCache[iconName + '.svg'];
  if (!innerHtml || !viewBox) return;

  // must first reset innerHTML on svgEl to innerHTML of our svg
  svgEl.innerHTML = innerHtml;
  // then must set viewBox on svgEl to viewBox on our icon
  svgEl.setAttribute('viewBox', viewBox);
}

function lookForMatch(fileName, isDir, iconMap) {
  // returns icon name string if matches otherwise undefined
  const lowerFileName = fileName.toLowerCase();
  // first look in fileNames and folderNames
  if (iconMap.fileNames[fileName] && !isDir) return iconMap.fileNames[fileName];
  if (iconMap.folderNames[fileName] && isDir) return iconMap.folderNames[fileName];

  // then check all lowercase
  if (iconMap.fileNames[lowerFileName] && !isDir) return iconMap.fileNames[lowerFileName];
  if (iconMap.folderNames[lowerFileName] && isDir) return iconMap.folderNames[lowerFileName];

  // look for extension in fileExtensions and languageIds
  const captureExtension = /.+(?<=\.)(.+)$/;
  const extension = fileName.match(captureExtension)?.[1];

  if (iconMap.fileExtensions[extension] && !isDir) return iconMap.fileExtensions[extension];
  if (iconMap.languageIds[extension] && !isDir) return iconMap.languageIds[extension];

  // look for filename and extension in vscode language map
  if (languageMap.fileNames[fileName] && !isDir) return languageMap.fileNames[fileName];
  if (languageMap.fileNames[lowerFileName] && !isDir) return languageMap.fileNames[lowerFileName];
  if (languageMap.fileExtensions[extension] && !isDir) return languageMap.fileExtensions[extension];

  // fallback into default file or folder if no matches
  if (!isDir) return 'file';
  if (isDir) return 'folder';
}
