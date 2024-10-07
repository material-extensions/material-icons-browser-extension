import { addCustomProvider } from '@/lib/custom-providers';
import { addGitProvider, providerConfig } from '@/providers';
import Browser from 'webextension-polyfill';
import { requestAccess } from './access';
import { getElementByIdOrThrow } from './helper';

export function displayDomainSettings() {
  getElementByIdOrThrow('domain-settings').style.display = 'block';
}

export function displayPageNotSupported(domain: string) {
  getElementByIdOrThrow('unsupported-domain').innerText = domain;
  getElementByIdOrThrow('not-supported').style.display = 'block';
}

export function askDomainAccess(tab: Browser.Tabs.Tab) {
  getElementByIdOrThrow('request').style.display = 'block';
  const clicked = () => {
    requestAccess(tab);
  };
  getElementByIdOrThrow('request-access').addEventListener('click', clicked);
}

export function displayCustomDomain(
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
