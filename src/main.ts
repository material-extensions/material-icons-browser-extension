import Browser from 'webextension-polyfill';
import { initIconAppearance } from './lib/icon-appearance';
import { initIconSizes } from './lib/icon-sizes';
import { getResolvedPageConfig } from './lib/page-config';
import { setExtensionProvider, setExtensionStatus } from './lib/page-status';
import { observePage, replaceAllIcons } from './lib/replace-icons';
import { addConfigChangeListener } from './lib/user-config';
import { Provider } from './models';
import { getGitProvider } from './providers';

interface Possibilities {
  [key: string]: string;
}

const init = async () => {
  initIconSizes();
  initIconAppearance();
  setExtensionStatus('loading');
  setExtensionProvider(null);

  try {
    const { href } = window.location;
    const provider = await getGitProvider(href);

    if (!provider) {
      setExtensionStatus('unsupported');
      return;
    }

    setExtensionProvider(provider.name);

    const config = await getResolvedPageConfig();

    if (!config.enabled) {
      setExtensionStatus('disabled');
      return;
    }

    const iconColorController = observePage(
      provider,
      config.iconPack,
      config.fileBindings,
      config.folderBindings,
      config.folderColor,
      config.fileColor,
      config.folderTheme
    );
    const refreshIcons = async () => {
      const { folderColor, fileColor, folderTheme } =
        await getResolvedPageConfig();
      const settings = { folderColor, fileColor, folderTheme };
      iconColorController.setSettings(settings);
      replaceAllIcons(provider, settings);
    };
    addConfigChangeListener('iconPack', refreshIcons);
    addConfigChangeListener('folderColor', refreshIcons);
    addConfigChangeListener('folderColor', refreshIcons, 'default');
    addConfigChangeListener('fileColor', refreshIcons);
    addConfigChangeListener('fileColor', refreshIcons, 'default');
    addConfigChangeListener('folderTheme', refreshIcons);
    addConfigChangeListener('folderTheme', refreshIcons, 'default');
    // Removal of a domain override has an undefined newValue, which the shared
    // listener intentionally ignores. Refresh so the inherited color takes effect.
    Browser.storage.onChanged.addListener((changes, areaName) => {
      if (
        areaName === 'sync' &&
        ['folderColor', 'fileColor', 'folderTheme'].some(
          (name) =>
            Object.hasOwn(changes, `${window.location.hostname}:${name}`) &&
            changes[`${window.location.hostname}:${name}`]?.newValue ===
              undefined
        )
      ) {
        refreshIcons();
      }
    });
    setExtensionStatus('active');
  } catch (error) {
    setExtensionStatus('error');
    throw error;
  }
};

type Handlers = {
  init: () => void;
  contentScriptReady: () => true;
  guessProvider: (possibilities: Possibilities) => string | null;
};

const handlers: Handlers = {
  init,
  contentScriptReady: () => true,
  guessProvider: (possibilities: Possibilities): string | null => {
    for (const [name, selector] of Object.entries(possibilities)) {
      if (document.querySelector(selector)) {
        return name;
      }
    }
    return null;
  },
};

const processExtensionCommand = (
  message: { cmd: keyof Handlers; args?: unknown[] },
  _: Browser.Runtime.MessageSender,
  sendResponse: (response?: any) => void
) => {
  if (!handlers[message.cmd]) {
    return sendResponse(null);
  }

  if (message.cmd === 'init') {
    handlers.init();
    return sendResponse(null);
  }

  if (message.cmd === 'contentScriptReady') {
    return sendResponse(handlers.contentScriptReady());
  }

  if (message.cmd === 'guessProvider') {
    const result = handlers[message.cmd](
      (message.args || [])[0] as unknown as Possibilities
    );
    return sendResponse(result);
  }
};

Browser.runtime.onMessage.addListener(
  processExtensionCommand as Browser.Runtime.OnMessageListener
);

init();
