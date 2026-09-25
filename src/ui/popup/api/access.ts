import Browser from 'webextension-polyfill';
import { ensureContentScriptRegisteredForTab } from '@/lib/content-script-registration';

export function checkAccess(tab: Browser.Tabs.Tab) {
  const { host } = new URL(tab.url ?? '');

  const perm = {
    permissions: ['activeTab'],
    origins: [`*://${host}/*`],
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
  const { host } = new URL(tab.url ?? '');

  const perm: Browser.Permissions.Permissions = {
    permissions: ['activeTab'],
    origins: [`*://${host}/*`],
  };

  // request the permission
  Browser.permissions.request(perm).then(async (granted: boolean) => {
    if (!granted) {
      return;
    }

    // when granted reload the popup to show ui changes
    window.location.reload();
  });

  // close the popup, in firefox it stays open for some reason.
  window.close();
}

