import { getConfig, setConfig } from '../../lib/userConfig';
import { getGitProvider } from '../../providers';

const isPageSupported = (domain) => !!getGitProvider(domain);

function getCurrentTabDomain() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  return new Promise((resolve) => {
    // firefox only supports callback from chrome.tab.query, not Promise return
    chrome.tabs.query(queryOptions, ([tab]) => resolve(tab && new URL(tab.url).hostname));
  });
}

getCurrentTabDomain().then((domain) => {
  if (!isPageSupported(domain)) return displayPageNotSupported(domain);

  registerControls(domain);
  displaySettings(domain);
  displayAllDisabledNote();
});

function registerControls(domain) {
  getConfig('iconSize', domain).then((size) => {
    document.getElementById('icon-size').value = size;
  });
  const updateIconSize = (event) => setConfig('iconSize', event.target.value, domain);
  document?.getElementById('icon-size')?.addEventListener('change', updateIconSize);

  getConfig('iconPack', domain).then((pack) => {
    document.getElementById('icon-pack').value = pack;
  });
  const updateIconPack = (event) => setConfig('iconPack', event.target.value, domain);
  document?.getElementById('icon-pack')?.addEventListener('change', updateIconPack);

  getConfig('extEnabled', domain).then((enabled) => {
    document.getElementById('enabled').checked = enabled;
  });
  const updateExtEnabled = (event) => setConfig('extEnabled', event.target.checked, domain);
  document?.getElementById('enabled')?.addEventListener('change', updateExtEnabled);

  document
    .getElementById('options-btn')
    ?.addEventListener('click', () => chrome.runtime.openOptionsPage());
}

function displaySettings(domain) {
  document.getElementById('domain-name').innerText = domain;
  document.getElementById('settings').style.display = 'block';
}

function displayPageNotSupported(domain) {
  document.getElementById('unsupported-domain').innerText = domain;
  document.getElementById('not-supported').style.display = 'block';
}

function displayAllDisabledNote() {
  getConfig('extEnabled', 'default').then((enabled) => {
    if (enabled) return;
    document.getElementById('default-disabled-note').style.display = 'block';
    document.getElementById('domain-settings').style.display = 'none';
    document
      .getElementById('options-link')
      ?.addEventListener('click', () => chrome.runtime.openOptionsPage());
  });
}
