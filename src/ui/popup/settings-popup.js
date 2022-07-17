const restoreOptions = () =>
  chrome.storage.sync
    .get({
      iconSize: 'md',
      iconPack: 'react',
    })
    .then(({ iconSize, iconPack }) => {
      document.getElementById('icon-size').value = iconSize;
      document.getElementById('icon-pack').value = iconPack;
    });

document.addEventListener('DOMContentLoaded', restoreOptions);

const updateIconSize = (event) => chrome.storage.sync.set({ iconSize: event.target.value });
document.getElementById('icon-size').addEventListener('change', updateIconSize);

const updateIconPack = (event) => chrome.storage.sync.set({ iconPack: event.target.value });
document.getElementById('icon-pack').addEventListener('change', updateIconPack);
