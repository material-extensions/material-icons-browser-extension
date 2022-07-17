const restoreOptions = () => {
  chrome.storage.sync.get(
    {
      iconSize: 'md',
    },
    (result) => {
      document.getElementById('icon-size').value = result.iconSize;
    }
  );
};
document.addEventListener('DOMContentLoaded', restoreOptions);

const updateIconSize = (event) => {
  const newSize = event.target.value;

  chrome.storage.sync.set({ iconSize: newSize });
};
document.getElementById('icon-size').addEventListener('change', updateIconSize);
