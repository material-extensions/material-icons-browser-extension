const getSizeConfig = () =>
  chrome.storage.sync
    .get({
      iconSize: 'md',
    })
    .then(({ iconSize }) => iconSize);

const setSizeAttribute = (iconSize) =>
  document.body.setAttribute(`data-material-icons-extension-size`, iconSize);

export const initIconSizes = () => {
  const setIconSize = () => getSizeConfig().then(setSizeAttribute);

  document.addEventListener('DOMContentLoaded', setIconSize, false);

  chrome.storage.onChanged.addListener((changes) => {
    const newIconSize = changes.iconSize?.newValue;
    if (newIconSize) document.body.setAttribute(`data-material-icons-extension-size`, newIconSize);
  });
};
