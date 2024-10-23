import Browser from 'webextension-polyfill';

export function checkAccess(tab: Browser.Tabs.Tab) {
  const { host } = new URL(tab.url ?? '');

  const perm = {
    permissions: ['activeTab'],
    origins: [`*://${host}/*`],
  };

  return Browser.permissions.contains(perm).then(async (r) => {
    if (r) {
      await ensureContentScriptRegistered(tab);

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

async function ensureContentScriptRegistered(tab: Browser.Tabs.Tab) {
  const { host } = new URL(tab.url ?? '');

  const scripts = await Browser.scripting.getRegisteredContentScripts({
    ids: ['material-icons'],
  });

  const pattern: string = `*://${host}/*`;

  if (!scripts.length) {
    // run the script now in the current tab to prevent need for reloading
    await Browser.scripting.executeScript({
      files: ['./main.js'],
      target: {
        tabId: tab.id ?? 0,
      },
    });

    // register content script for future use
    return Browser.scripting.registerContentScripts([
      {
        id: 'material-icons',
        js: ['./main.js'],
        css: ['./injected-styles.css'],
        matches: [pattern],
        runAt: 'document_start',
      },
    ]);
  }

  const matches = scripts[0].matches ?? [];

  // if we somehow already registered the script for requested origin, skip it
  if (matches.includes(pattern)) {
    return;
  }

  // add new origin to content script
  return Browser.scripting.updateContentScripts([
    {
      id: 'material-icons',
      matches: [...matches, pattern],
    },
  ]);
}
