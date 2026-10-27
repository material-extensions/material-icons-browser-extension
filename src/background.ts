import Browser from 'webextension-polyfill';
import { restoreRegisteredCustomProviderScripts } from './providers';

Browser.runtime.onInstalled.addListener(() => {
  restoreRegisteredCustomProviderScripts();
});

Browser.runtime.onStartup.addListener(() => {
  restoreRegisteredCustomProviderScripts();
});

// Safari: content scripts can't load extension URLs on pages with a strict CSP,
// so they ask for icons as data: URLs instead (see replace-icon.ts).
Browser.runtime.onMessage.addListener((message: unknown) => {
  const { cmd, iconName } = message as { cmd?: string; iconName?: string };
  if (cmd !== 'getIconDataUrl' || !iconName) return undefined;
  return fetch(Browser.runtime.getURL(iconName))
    .then((res) => res.text())
    .then(
      (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    );
});

Browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.customProviders) {
    restoreRegisteredCustomProviderScripts();
  }
});
