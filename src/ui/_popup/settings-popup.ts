import { ProviderMap } from '@/models';
import { IconPackValue } from 'material-icon-theme';
import Browser from 'webextension-polyfill';
import { addCustomProvider } from '../../lib/custom-providers';
import { IconSize } from '../../lib/icon-sizes';
import { getConfig, setConfig } from '../../lib/user-config';
import {
  addGitProvider,
  getGitProvider,
  providerConfig,
} from '../../providers';

function init(tab: Browser.Tabs.Tab) {
  const domain = new URL(tab.url ?? '').host;

  setDomain(domain);

  isPageSupported(domain).then((supported) => {
    if (!supported) {
      // we are in some internal browser page, not supported.
      if (tab.url && !tab.url.startsWith('http')) {
        return displayPageNotSupported(domain);
      }

      return checkAccess(tab).then((access) => {
        if (access === false) {
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
