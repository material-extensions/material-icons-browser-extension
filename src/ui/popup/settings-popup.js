import Browser from 'webextension-polyfill';
import { addCustomProvider } from '../../lib/custom-providers';
import { getConfig, setConfig } from '../../lib/userConfig';
import { addGitProvider, getGitProvider, providerConfig } from '../../providers';

const HOST_IS_NEW = 1;
const HOST_NO_MATCH = 2;

const isPageSupported = (domain) => getGitProvider(domain);

function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };

  return Browser.tabs.query(queryOptions).then(([tab]) => tab);
}

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
    ?.addEventListener('click', () => Browser.runtime.openOptionsPage());
}

function setDomain(domain) {
  document.getElementById('domain-name').innerText = domain;
}

function displayDomainSettings() {
  document.getElementById('domain-settings').style.display = 'block';
}

function displayPageNotSupported(domain) {
  document.getElementById('unsupported-domain').innerText = domain;
  document.getElementById('not-supported').style.display = 'block';
}

function askDomainAccess(tab) {
  document.getElementById('request').style.display = 'block';
  const clicked = () => {
    requestAccess(tab);
    // window.close();
  };
  document.getElementById('request-access').addEventListener('click', clicked);
}

function displayCustomDomain(tab, domain, suggestedProvider) {
  document.getElementById('enable-wrapper').style.display = 'none';
  document.getElementById('icon-size-wrapper').style.display = 'none';
  document.getElementById('icon-pack-wrapper').style.display = 'none';

  const btn = document.getElementById('add-provider');
  const providerEl = document.getElementById('provider-wrapper');

  btn.style.display = 'block';
  providerEl.style.display = 'block';

  const select = providerEl.querySelector('#provider');

  for (const provider of Object.values(providerConfig)) {
    if (!provider.isCustom && provider.canSelfHost) {
      const selected = provider.name === suggestedProvider;
      const opt = new Option(provider.name, provider.name, selected, selected);

      select.append(opt);
    }
  }

  const addProvider = () => {
    addCustomProvider(domain, select.value).then(() => {
      addGitProvider(domain, select.value);

      const cmd = {
        cmd: 'init',
      };

      Browser.tabs.sendMessage(tab.id, cmd);

      // reload the popup to show the settings.
      window.location.reload();
    });
  };

  btn.addEventListener('click', addProvider);
}

function displayAllDisabledNote() {
  getConfig('extEnabled', 'default').then((enabled) => {
    if (enabled) return;
    document.getElementById('default-disabled-note').style.display = 'block';
    document.getElementById('domain-settings').style.display = 'none';
    document
      .getElementById('options-link')
      ?.addEventListener('click', () => Browser.runtime.openOptionsPage());
  });
}

function guessProvider(tab) {
  const possibilities = {};

  for (const provider of Object.values(providerConfig)) {
    if (!provider.isCustom && provider.canSelfHost && provider.selectors.detect) {
      possibilities[provider.name] = provider.selectors.detect;
    }
  }

  const cmd = {
    cmd: 'guessProvider',
    args: [possibilities],
  };

  return Browser.tabs.sendMessage(tab.id, cmd).then((match) => {
    if (match === null) {
      return HOST_NO_MATCH;
    }

    return match;
  });
}

function checkAccess(tab) {
  const { host } = new URL(tab.url);

  const perm = {
    permissions: ['activeTab'],
    origins: [`*://${host}/*`],
  };

  return Browser.permissions.contains(perm).then((r) => {
    if (r) {
      return tab;
    }

    return HOST_IS_NEW;
  });
}

function requestAccess(tab) {
  const { host } = new URL(tab.url);

  return Browser.runtime.sendMessage({
    event: 'request-access',
    data: {
      tabId: tab.id,
      url: tab.url,
      host,
    },
  });
}

function doGuessProvider(tab, domain) {
  return guessProvider(tab).then((match) => {
    if (match !== HOST_NO_MATCH) {
      registerControls(domain);
      displayDomainSettings();

      return displayCustomDomain(tab, domain, match);
    }

    return displayPageNotSupported(domain);
  });
}

function isFirefox() {
  return typeof browser !== 'undefined' && typeof chrome !== 'undefined';
}

function init(tab) {
  const domain = new URL(tab.url).host;

  setDomain(domain);

  isPageSupported(domain).then((supported) => {
    if (!supported) {
      // we are in some internal browser page, not supported.
      if (!tab.url.startsWith('http')) {
        return displayPageNotSupported(domain);
      }

      // overwrite for firefox browser, currently does not support
      // asking for permissions from background, so it will run
      // on all pages.
      if (isFirefox()) {
        return doGuessProvider(tab, domain);
      }

      return checkAccess(tab).then((access) => {
        if (access === HOST_IS_NEW) {
          return askDomainAccess(tab);
        }

        return doGuessProvider(tab, domain);
      });
    }

    registerControls(domain);
    displayDomainSettings();
    displayAllDisabledNote();
  });
}

getCurrentTab().then(init);
