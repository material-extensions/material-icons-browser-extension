import { ProviderMap } from '@/models';
import { providerConfig } from '@/providers';
import Browser from 'webextension-polyfill';
import { registerControls } from './controls';
import {
  displayCustomDomain,
  displayDomainSettings,
  displayPageNotSupported,
} from './custom-domain';

export function guessProvider(tab: Browser.Tabs.Tab) {
  const possibilities: ProviderMap = {};

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
      return false;
    }

    return match;
  });
}

export function doGuessProvider(tab: Browser.Tabs.Tab, domain: string) {
  return guessProvider(tab).then((match) => {
    if (match !== false) {
      registerControls(domain);
      displayDomainSettings();

      return displayCustomDomain(tab, domain, match);
    }

    return displayPageNotSupported(domain);
  });
}
