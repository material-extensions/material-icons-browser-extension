import Browser from 'webextension-polyfill';
import { ensureContentScriptRegisteredForTab } from '@/lib/content-script-registration';
import { getExtensionOriginPattern } from '@/lib/url-patterns';

export function checkAccess(tab: Browser.Tabs.Tab) {
  const perm = {
    permissions: ['activeTab'],
    origins: [getExtensionOriginPattern(tab.url ?? '')],
  };

  return Browser.permissions.contains(perm).then(async (r) => {
    if (r) {
      await ensureContentScriptRegisteredForTab(tab);

      return tab;
    }

    return false;
  });
}

export function requestAccess(tab: Browser.Tabs.Tab) {
  const perm: Browser.Permissions.Permissions = {
    permissions: ['activeTab'],
    origins: [getExtensionOriginPattern(tab.url ?? '')],
  };

  return Browser.permissions.request(perm).then(async (granted: boolean) => {
    if (!granted) {
      return false;
    }

    await ensureContentScriptRegisteredForTab(tab);

    return true;
  });
}
