import Browser from 'webextension-polyfill';
import { addCustomProvider } from '../../lib/custom-providers';
import { getConfig, setConfig } from '../../lib/user-config';
import {
  addGitProvider,
  getGitProvider,
  providerConfig,
} from '../../providers';

const HOST_IS_NEW = 1;
const HOST_NO_MATCH = 2;

const isPageSupported = (domain: string) => getGitProvider(domain);

function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };

  return Browser.tabs.query(queryOptions).then(([tab]) => tab);
}

function registerControls(domain: string) {
  getConfig('iconSize', domain).then((size) => {
    getElementByIdOrThrow<HTMLInputElement>('icon-size').value = size;
  });
  const updateIconSize = (event: Event) =>
    setConfig('iconSize', (event.target as HTMLInputElement).value, domain);
  document
    ?.getElementById('icon-size')
    ?.addEventListener('change', updateIconSize);

  getConfig('iconPack', domain).then((pack) => {
    getElementByIdOrThrow<HTMLInputElement>('icon-pack').value = pack;
  });
  const updateIconPack = (event: Event) =>
    setConfig('iconPack', (event.target as HTMLInputElement).value, domain);
  document
    ?.getElementById('icon-pack')
    ?.addEventListener('change', updateIconPack);

  getConfig('extEnabled', domain).then((enabled) => {
    getElementByIdOrThrow<HTMLInputElement>('enabled').checked = enabled;
  });
  const updateExtEnabled = (event: Event) =>
    setConfig('extEnabled', (event.target as HTMLInputElement).checked, domain);
  document
    ?.getElementById('enabled')
    ?.addEventListener('change', updateExtEnabled);

  document
    .getElementById('options-btn')
    ?.addEventListener('click', () => Browser.runtime.openOptionsPage());
}

function setDomain(domain: string) {
  getElementByIdOrThrow('domain-name').innerText = domain;
}

function displayDomainSettings() {
  getElementByIdOrThrow('domain-settings').style.display = 'block';
}

function displayPageNotSupported(domain: string) {
  getElementByIdOrThrow('unsupported-domain').innerText = domain;
  getElementByIdOrThrow('not-supported').style.display = 'block';
}

function askDomainAccess(tab: Browser.Tabs.Tab) {
  getElementByIdOrThrow('request').style.display = 'block';
  const clicked = () => {
    requestAccess(tab);
  };
  getElementByIdOrThrow('request-access').addEventListener('click', clicked);
}

function displayCustomDomain(
  tab: Browser.Tabs.Tab,
  domain: string,
  suggestedProvider: string
) {
  getElementByIdOrThrow('enable-wrapper').style.display = 'none';
  getElementByIdOrThrow('icon-size-wrapper').style.display = 'none';
  getElementByIdOrThrow('icon-pack-wrapper').style.display = 'none';

  const btn = getElementByIdOrThrow('add-provider');
  const providerEl = getElementByIdOrThrow('provider-wrapper');

  btn.style.display = 'block';
  providerEl.style.display = 'block';

  const select = providerEl.querySelector(
    '#provider'
  ) as HTMLInputElement | null;

  for (const provider of Object.values(providerConfig)) {
    if (!provider.isCustom && provider.canSelfHost) {
      const selected = provider.name === suggestedProvider;
      const opt = new Option(provider.name, provider.name, selected, selected);

      select?.append(opt);
    }
  }

  const addProvider = () => {
    if (!select) return;
    addCustomProvider(domain, select.value).then(() => {
      addGitProvider(domain, select.value);

      const cmd = {
        cmd: 'init',
      };

      Browser.tabs.sendMessage(tab.id ?? 0, cmd);

      // reload the popup to show the settings.
      window.location.reload();
    });
  };

  btn.addEventListener('click', addProvider);
}

function displayAllDisabledNote() {
  getConfig('extEnabled', 'default').then((enabled) => {
    if (enabled) return;
    getElementByIdOrThrow('default-disabled-note').style.display = 'block';
    getElementByIdOrThrow('domain-settings').style.display = 'none';
    document
      .getElementById('options-link')
      ?.addEventListener('click', () => Browser.runtime.openOptionsPage());
  });
}

function guessProvider(tab: Browser.Tabs.Tab) {
  const possibilities: Record<string, string> = {};

  for (const provider of Object.values(providerConfig)) {
    if (
      !provider.isCustom &&
      provider.canSelfHost &&
      provider.selectors.detect
    ) {
      possibilities[provider.name] = provider.selectors.detect;
    }
  }

  const cmd = {
    cmd: 'guessProvider',
    args: [possibilities],
  };

  return Browser.tabs.sendMessage(tab.id ?? 0, cmd).then((match) => {
    if (match === null) {
      return HOST_NO_MATCH;
    }

    return match;
  });
}

function getElementByIdOrThrow<T = HTMLElement>(id: string): NonNullable<T> {
  const el = document.getElementById(id) as T | null;
  if (!el) {
    throw new Error(`Element with id ${id} not found`);
  }

  return el;
}

function checkAccess(tab: Browser.Tabs.Tab) {
  const { host } = new URL(tab.url ?? '');

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

function requestAccess(tab: Browser.Tabs.Tab) {
  const { host } = new URL(tab.url ?? '');

  return Browser.runtime.sendMessage({
    event: 'request-access',
    data: {
      tabId: tab.id,
      host,
    },
  });
}

function doGuessProvider(tab: Browser.Tabs.Tab, domain: string) {
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
  return navigator.userAgent.toLowerCase().includes('firefox');
}

function init(tab: Browser.Tabs.Tab) {
  const domain = new URL(tab.url ?? '').host;

  setDomain(domain);

  isPageSupported(domain).then((supported) => {
    if (!supported) {
      // we are in some internal browser page, not supported.
      if (tab.url && !tab.url.startsWith('http')) {
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
