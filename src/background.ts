import Browser from 'webextension-polyfill';
import { restoreRegisteredCustomProviderScripts } from './providers';

Browser.runtime.onInstalled.addListener(() => {
  restoreRegisteredCustomProviderScripts();
});

Browser.runtime.onStartup.addListener(() => {
  restoreRegisteredCustomProviderScripts();
});

Browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.customProviders) {
    restoreRegisteredCustomProviderScripts();
  }
});
