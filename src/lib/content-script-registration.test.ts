import { beforeEach, describe, expect, it, vi } from 'vitest';
import Browser from 'webextension-polyfill';
import {
  CONTENT_SCRIPT_ID,
  ensureContentScriptRegisteredForTab,
  getContentScriptPattern,
  registerContentScriptForHost,
} from './content-script-registration';

vi.mock('webextension-polyfill', () => ({
  default: {
    scripting: {
      getRegisteredContentScripts: vi.fn(),
      registerContentScripts: vi.fn(),
      updateContentScripts: vi.fn(),
      executeScript: vi.fn(),
    },
  },
}));

const scripting = Browser.scripting as unknown as {
  getRegisteredContentScripts: ReturnType<typeof vi.fn>;
  registerContentScripts: ReturnType<typeof vi.fn>;
  updateContentScripts: ReturnType<typeof vi.fn>;
  executeScript: ReturnType<typeof vi.fn>;
};

describe('content-script-registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    scripting.getRegisteredContentScripts.mockResolvedValue([]);
    scripting.registerContentScripts.mockResolvedValue(undefined);
    scripting.updateContentScripts.mockResolvedValue(undefined);
    scripting.executeScript.mockResolvedValue(undefined);
  });

  it('builds a host permission match pattern', () => {
    expect(getContentScriptPattern('git.example.local')).toBe(
      '*://git.example.local/*'
    );
  });

  it('registers the content script when no dynamic script exists yet', async () => {
    await registerContentScriptForHost('git.example.local');

    expect(scripting.registerContentScripts).toHaveBeenCalledWith([
      {
        id: CONTENT_SCRIPT_ID,
        js: ['./main.js'],
        css: ['./injected-styles.css'],
        matches: ['*://git.example.local/*'],
        runAt: 'document_start',
      },
    ]);
    expect(scripting.updateContentScripts).not.toHaveBeenCalled();
  });

  it('adds a custom host to the existing dynamic content script', async () => {
    scripting.getRegisteredContentScripts.mockResolvedValue([
      { id: CONTENT_SCRIPT_ID, matches: ['*://git.internal/*'] },
    ]);

    await registerContentScriptForHost('git.example.local');

    expect(scripting.updateContentScripts).toHaveBeenCalledWith([
      {
        id: CONTENT_SCRIPT_ID,
        matches: ['*://git.internal/*', '*://git.example.local/*'],
      },
    ]);
    expect(scripting.registerContentScripts).not.toHaveBeenCalled();
  });

  it('does not duplicate an already registered custom host', async () => {
    scripting.getRegisteredContentScripts.mockResolvedValue([
      { id: CONTENT_SCRIPT_ID, matches: ['*://git.example.local/*'] },
    ]);

    await registerContentScriptForHost('git.example.local');

    expect(scripting.registerContentScripts).not.toHaveBeenCalled();
    expect(scripting.updateContentScripts).not.toHaveBeenCalled();
  });

  it('executes the content script immediately when the current tab is not registered yet', async () => {
    await ensureContentScriptRegisteredForTab({
      id: 123,
      url: 'https://git.example.local/org/repo',
      index: 0,
      highlighted: false,
      active: true,
      pinned: false,
      incognito: false,
    } as Browser.Tabs.Tab);

    expect(scripting.executeScript).toHaveBeenCalledWith({
      files: ['./main.js'],
      target: { tabId: 123 },
    });
    expect(scripting.registerContentScripts).toHaveBeenCalled();
  });

  it('does not execute the content script again when the current tab is already registered', async () => {
    scripting.getRegisteredContentScripts.mockResolvedValue([
      { id: CONTENT_SCRIPT_ID, matches: ['*://git.example.local/*'] },
    ]);

    await ensureContentScriptRegisteredForTab({
      id: 123,
      url: 'https://git.example.local/org/repo',
      index: 0,
      highlighted: false,
      active: true,
      pinned: false,
      incognito: false,
    } as Browser.Tabs.Tab);

    expect(scripting.executeScript).not.toHaveBeenCalled();
  });
});
