import Browser from 'webextension-polyfill';
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

    observePage(
      provider,
      config.iconPack,
      config.fileBindings,
      config.folderBindings
    );
    addConfigChangeListener('iconPack', () => replaceAllIcons(provider));
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
