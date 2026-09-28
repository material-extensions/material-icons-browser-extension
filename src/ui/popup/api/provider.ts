import Browser from 'webextension-polyfill';
import { ProviderMap } from '@/models';
import { getSelfHostableProviders } from '@/providers';

export async function guessProvider(tab: Browser.Tabs.Tab) {
  await Browser.tabs.sendMessage(tab.id ?? 0, { cmd: 'contentScriptReady' });

  const possibilities: ProviderMap = {};

  for (const provider of getSelfHostableProviders()) {
    if (provider.selectors.detect) {
      possibilities[provider.name] = provider.selectors.detect;
    }
  }

  const cmd = {
    cmd: 'guessProvider',
    args: [possibilities],
  };

  return (await Browser.tabs.sendMessage(tab.id ?? 0, cmd)) ?? false;
}
