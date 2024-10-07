import Browser from 'webextension-polyfill';
import { checkAccess } from './access';
import { registerControls } from './controls';
import {
  askDomainAccess,
  displayDomainSettings,
  displayPageNotSupported,
  setDomain,
} from './custom-domain';
import { displayAllDisabledNote } from './disabled-note';
import { isPageSupported } from './helper';
import { doGuessProvider } from './provider';

export function init(tab: Browser.Tabs.Tab) {
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
