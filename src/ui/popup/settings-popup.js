import { getConfig, setConfig } from '../../lib/userConfig';

function getCurrentTabDomain() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  return chrome.tabs.query(queryOptions).then(([tab]) => tab && new URL(tab.url).hostname);
}

getCurrentTabDomain().then((domain) => {
  const restoreOptions = () => {
    getConfig('iconSize', domain).then((size) => {
      document.getElementById('icon-size').value = size;
    });

    getConfig('iconPack', domain).then((pack) => {
      document.getElementById('icon-pack').value = pack;
    });
  };
  document.addEventListener('DOMContentLoaded', restoreOptions);

  const updateIconSize = (event) => setConfig('iconSize', event.target.value, domain);
  document?.getElementById('icon-size')?.addEventListener('change', updateIconSize);

  const updateIconPack = (event) => setConfig('iconPack', event.target.value, domain);
  document?.getElementById('icon-pack')?.addEventListener('change', updateIconPack);
});
