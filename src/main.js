runExtension()

document.addEventListener('click', () => {
  setTimeout(runExtension, 600)
})

function runExtension() {
  console.log(`loaded ${window.location.href}`);
  const jsonUrl = chrome.runtime.getURL('iconMap.json');

  fetch(jsonUrl)
    .then((response) => response.json())
    .then((iconMap) => {
      // debug(iconMap)

      const fileList = document.querySelector('[aria-labelledby=files]'); // get file box
      if (!fileList) return;
      const fileRows = fileList.querySelectorAll('.Box-row');
      fileRows.forEach((row) => replaceIcon(row, iconMap));
    });
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

function lookForMatch(fileName, iconMap) {
  // returns icon name string if matches otherwise undefined

  // first look in fileNames and folderNames
  if (iconMap.fileNames[fileName]) return iconMap.fileNames[fileName];
  if (iconMap.folderNames[fileName]) return iconMap.folderNames[fileName];

  // look for extension in fileExtensions and languageIds
  // const extRgx = /(?<=\.).+$/
  const captureExtension = /.+(?<=\.)(.+)$/;
  const extension = fileName.replace(captureExtension, '$1');

  if (iconMap.fileExtensions[extension]) return iconMap.fileExtensions[extension];
  if (iconMap.languageIds[extension]) return iconMap.languageIds[extension];
}

function replaceIcon(fileRow, iconMap) {
  // get file/folder name
  const fileName = fileRow.querySelector('[role=rowheader]')?.firstElementChild?.firstElementChild
    ?.innerText;
  if (!fileName) return; // fileName couldn't be found or we don't have a match for it

  // replacing svg
  const svgEl = fileRow.querySelector('.octicon');
  if (!svgEl) return; // couldn't find svg element

  // get icon filename
  const iconName = lookForMatch(fileName, iconMap); // returns iconname if found or undefined
  if (!iconName) return;

  // TODO: 'changes' and 'security' exist both on iconMap.fileNames and iconMap.folderNames

  getIcon(iconName).then(({ innerSVG, viewBox }) => {
    // must first reset innerHTML on svgEl to innerHTML of our svg
    svgEl.innerHTML = innerSVG;
    // then must set viewBox on svgEl to viewBox on our icon
    svgEl.setAttribute('viewBox', viewBox);
  });
}

/////// Detect location change on github since it's SPA
// https://stackoverflow.com/questions/6390341/how-to-detect-if-url-has-changed-after-hash-in-javascript/52809105#52809105

// const targetNode = document;
// const observerOptions = {
//   childList: true,
//   attributes: true,

//   // Omit (or set to false) to observe only changes to the parent node
//   subtree: true
// }

// const observer = new MutationObserver(runExtension);
// observer.observe(targetNode, observerOptions);