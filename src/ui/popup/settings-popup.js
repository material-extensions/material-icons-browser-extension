import { getConfig, setConfig } from '../../lib/userConfig';
import { getGitProvider } from '../../providers';

const isPageSupported = (domain) => !!getGitProvider(domain);

function getCurrentTabDomain() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  return chrome.tabs.query(queryOptions).then(([tab]) => tab && new URL(tab.url).hostname);
}

getCurrentTabDomain().then((domain) => {
  if (!isPageSupported(domain)) return displayPageNotSupported(domain);

  displayDomainName(domain);
  displaySettings();
  registerControls(domain);
});

function registerControls(domain) {
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
}

function displayDomainName(domain) {
  document.getElementById('domain-name').innerText = domain;
}

function displaySettings() {
  document.getElementById('settings').style.display = 'block';
}

function displayPageNotSupported(domain) {
  document.getElementById('unsupported-domain').innerText = domain;
  document.getElementById('not-supported').style.display = 'block';
}
