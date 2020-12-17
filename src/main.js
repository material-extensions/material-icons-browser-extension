// const matches = {
//   '.eslintrc.js': 'eslint',
//   '.eslintrc.cjs': 'eslint',
//   '.eslintrc.yaml': 'eslint',
//   '.eslintrc.yml': 'eslint',
//   '.eslintrc.json': 'eslint',
//   '.eslintrc': 'eslint',
//   '.eslintignore': 'eslint',
//   '.eslintcache': 'eslint',
// };

const jsonUrl = chrome.runtime.getURL('iconMap.json');

fetch(jsonUrl)
  .then((response) => response.json())
  .then((iconMap) => {
    const fileList = document.querySelector('[aria-labelledby=files]'); // get file box
    const fileRows = fileList.querySelectorAll('.Box-row');
    fileRows.forEach(row => replaceIcon(row, iconMap));
  });

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

function replaceIcon(fileRow, iconMap) {
  // get file/folder name
  const fileName = fileRow.querySelector('[role=rowheader]')?.firstElementChild?.firstElementChild
    ?.innerText;
  if (!fileName) return; // fileName couldn't be found or we don't have a match for it

  // replacing svg
  const svgEl = fileRow.querySelector('.octicon');
  if (!svgEl) return; // couldn't find svg element

  // get icon filename
  const iconName = iconMap.fileNames[fileName];
  if (!iconName) return;

// if (fileName !== '.eslintrc') return

  getIcon(iconMap.fileNames[fileName]).then(({ innerSVG, viewBox }) => {
    // must first reset innerHTML on svgEl to innerHTML of our svg
    svgEl.innerHTML = innerSVG;
    // then must set viewBox on svgEl to viewBox on our icon
    svgEl.setAttribute('viewBox', viewBox);
  });
}
