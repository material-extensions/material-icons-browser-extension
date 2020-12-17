

// document.addEventListener('click', () => {
//   setTimeout(runExtension, 600)
// })

// rerun extension when github adds new file browser rows to DOM
const targetNode = document;

// Options for the observer (which mutations to observe)
const observerOptions = { childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = function (mutationsList, observer) {
  // Use traditional 'for loops' for IE 11
  for (const mutation of mutationsList) {
    const addedNodes = [...mutation.addedNodes];
    const mustHaveClasses = 'container-xl.clearfix.new-discussion-timeline.px-3.px-md-4.px-lg-5'.replace(/\./g,' ');

    if (addedNodes.length > 0) {
      if (addedNodes[0].className === mustHaveClasses) {
        if (addedNodes[0].querySelector('.Box-row')) {
          observer.disconnect() // stop listening for changes while we run our substitutions
          runExtension()
        }
      }
    }
  }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, observerOptions);

// run on load
runExtension();
//////

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
      fileRows.forEach((row,i, arr) => {
        const isLast = i === arr.length -1;
        replaceIcon(row, iconMap,isLast);
      });
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
  const lowerFileName = fileName.toLowerCase();
  // first look in fileNames and folderNames
  if (iconMap.fileNames[fileName]) return iconMap.fileNames[fileName];
  if (iconMap.folderNames[fileName]) return iconMap.folderNames[fileName];

  // then check all lowercase
  if (iconMap.fileNames[lowerFileName]) return iconMap.fileNames[lowerFileName];
  if (iconMap.folderNames[lowerFileName]) return iconMap.folderNames[lowerFileName];

  // look for extension in fileExtensions and languageIds
  // const extRgx = /(?<=\.).+$/
  const captureExtension = /.+(?<=\.)(.+)$/;
  const extension = fileName.replace(captureExtension, '$1');

  if (iconMap.fileExtensions[extension]) return iconMap.fileExtensions[extension];
  if (iconMap.languageIds[extension]) return iconMap.languageIds[extension];

  // TODO: fallback into default file or folder if no matches
}

function replaceIcon(fileRow, iconMap, isLastIcon) {
  if (isLastIcon) observer.observe(targetNode, observerOptions); // TODO: should run after last insertion, not before
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

