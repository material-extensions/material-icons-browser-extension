import Browser from 'webextension-polyfill';
import { checkAccess } from './access';
import { registerControls } from './controls';
import {
  askDomainAccess,
  displayDomainSettings,
  displayPageNotSupported,
} from './custom-domain';
import { displayAllDisabledNote } from './disabled-note';
import { isPageSupported } from './helper';
import { doGuessProvider } from './provider';

export async function init(tab: Browser.Tabs.Tab) {
  const domain = new URL(tab.url ?? '').host;

  const supported = await isPageSupported(domain);
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
}
