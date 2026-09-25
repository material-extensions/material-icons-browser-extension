import Browser from 'webextension-polyfill';

export const CONTENT_SCRIPT_ID = 'material-icons';

export const getContentScriptPattern = (host: string): string => `*://${host}/*`;

export async function registerContentScriptForHost(host: string): Promise<void> {
  const pattern = getContentScriptPattern(host);
  const scripts = await Browser.scripting.getRegisteredContentScripts({
    ids: [CONTENT_SCRIPT_ID],
  });

  if (!scripts.length) {
    await Browser.scripting.registerContentScripts([
      {
        id: CONTENT_SCRIPT_ID,
        js: ['./main.js'],
        css: ['./injected-styles.css'],
        matches: [pattern],
        runAt: 'document_start',
      },
    ]);
    return;
  }

  const matches = scripts[0].matches ?? [];
  if (matches.includes(pattern)) return;

  await Browser.scripting.updateContentScripts([
    {
      id: CONTENT_SCRIPT_ID,
      matches: [...matches, pattern],
    },
  ]);
}

export async function executeContentScriptInTab(tabId: number): Promise<void> {
  await Browser.scripting.executeScript({
    files: ['./main.js'],
    target: { tabId },
  });
}

export async function ensureContentScriptRegisteredForTab(
  tab: Browser.Tabs.Tab
): Promise<void> {
  if (!tab.id || !tab.url) return;

  const { host } = new URL(tab.url);
  const pattern = getContentScriptPattern(host);
  const scripts = await Browser.scripting.getRegisteredContentScripts({
    ids: [CONTENT_SCRIPT_ID],
  });
  const matches = scripts[0]?.matches ?? [];

  if (!matches.includes(pattern)) {
    await executeContentScriptInTab(tab.id);
  }

  await registerContentScriptForHost(host);
}
