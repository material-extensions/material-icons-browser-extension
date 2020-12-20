const successThreshold = 60;

// rerun extension when github adds new file browser rows to DOM
const targetNode = document;

// Options for the observer (which mutations to observe)
const observerOptions = { childList: true, subtree: true };

const mutationCB = function (mutationsList, observer) {
  for (const mutation of mutationsList) {
    const addedNodes = [...mutation.addedNodes];
    const mustHaveClasses = 'container-xl.clearfix.new-discussion-timeline.px-3.px-md-4.px-lg-5'.replace(
      /\./g,
      ' '
    );

    if (addedNodes.length > 0) {
      if (addedNodes[0].className === mustHaveClasses) {
        if (addedNodes[0].querySelector('.Box-row')) {
          runExtension();
          break; // ensure only one execution of runExtension is triggered;
        }
      }
    }
  }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(mutationCB);
observer.observe(targetNode, observerOptions);

// run on load
runExtension();
//////

function runExtension() {
  observer.disconnect(); // stop listening for changes while we run our substitutions
  const jsonUrl = chrome.runtime.getURL('iconMap.json');

  fetch(jsonUrl)
    .then((response) => response.json())
    .then((iconMap) => {
      const fileList = document.querySelector('[aria-labelledby=files]'); // get file box
      if (!fileList) return;

      const fileRows = fileList.querySelectorAll('.Box-row');
      fileRows.forEach((row, i, arr) => {
        const isLast = i === arr.length - 1;
        replaceIcon(row, iconMap, isLast);
      });
    });
}

function replaceIcon(fileRow, iconMap, isLastIcon) {
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

  getIcon(iconName)
    .then(({ innerSVG, viewBox }) => {
      // must first reset innerHTML on svgEl to innerHTML of our svg
      svgEl.innerHTML = innerSVG;
      // then must set viewBox on svgEl to viewBox on our icon
      svgEl.setAttribute('viewBox', viewBox);
      svgEl.classList.add('material-icons-ext');
    })
    .then(() => {
      if (isLastIcon) {
        checkIconPersists();
        observer.observe(targetNode, observerOptions); 
      }
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

function checkIconPersists() {
  let consecutiveSucesses = 0;
  const timer = setInterval(() => {
    const materialIcon = document.querySelector('div.Box-row > div.mr-3 > svg.material-icons-ext');
    if (!materialIcon) {
      clearInterval(timer);
      runExtension();
    } else {
      consecutiveSucesses++;
      if (consecutiveSucesses >= successThreshold) clearInterval(timer);
    }
  }, 50);
}
