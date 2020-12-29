import { observe } from 'selector-observer';

// run on load
const jsonUrl = chrome.runtime.getURL('iconMap.json');
const iconSelector = '.js-navigation-container > .js-navigation-item';

fetch(jsonUrl)
  .then((response) => response.json())
  .then((iconMap) => {
    manualRun(iconMap);
    observe(iconSelector, {
      add(row) {
        replaceIcon(row, iconMap);
      },
    });
  });

//

///
function manualRun(iconMap) {
  const fileRows = document.querySelectorAll(iconSelector);
  fileRows.forEach((row) => {
    replaceIcon(row, iconMap);
  });
}

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

  getIcon(iconName).then(({ innerSVG, viewBox }) => {
    // must first reset innerHTML on svgEl to innerHTML of our svg
    svgEl.innerHTML = innerSVG;
    // then must set viewBox on svgEl to viewBox on our icon
    svgEl.setAttribute('viewBox', viewBox);
  });
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

  // fallback into default file or folder if no matches
  if (!isDir) return 'file';
  if (isDir) return 'folder';
}

function getIcon(iconName) {
  const filePath = 'icons/' + iconName + '.svg';
  const url = chrome.runtime.getURL(filePath);

  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => response.text())
      .then((svgStr) => {
        const tempEl = document.createElement('div');
        tempEl.innerHTML = svgStr;
        const svg = tempEl.firstElementChild;

        const viewBox = svg.getAttribute('viewBox');
        const innerSVG = svg.innerHTML;

        if (!viewBox || !innerSVG) reject('fail');

        resolve({
          innerSVG,
          viewBox,
        });
      })
      .catch((error) => reject(error));
  });
}
