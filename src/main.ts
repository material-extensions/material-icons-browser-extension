import { IconPackValue } from 'material-icon-theme';
import Browser from 'webextension-polyfill';
import { initIconSizes } from './lib/icon-sizes';
import { observePage, replaceAllIcons } from './lib/replace-icons';
import { addConfigChangeListener, getConfig } from './lib/user-config';
import { Provider } from './models';
import { getGitProvider } from './providers';

interface Possibilities {
  [key: string]: string;
}

const init = async () => {
  initIconSizes();
  const { href } = window.location;
  await handleProvider(href);
};

const handleProvider = async (href: string) => {
  const provider: Provider | null = await getGitProvider(href);
  if (!provider) return;

  const iconPack = await getConfig('iconPack');
  const fileBindings = await getConfig('fileIconBindings');
  const folderBindings = await getConfig('folderIconBindings');
  const languageBindings = await getConfig('languageIconBindings');
  const extEnabled = await getConfig('extEnabled');
  const globalExtEnabled = await getConfig('extEnabled', 'default');

  if (!globalExtEnabled || !extEnabled) return;

  observePage(
    provider,
    iconPack,
    fileBindings,
    folderBindings,
    languageBindings
  );
  addConfigChangeListener('iconPack', () => replaceAllIcons(provider));
};

type Handlers = {
  init: () => void;
  guessProvider: (possibilities: Possibilities) => string | null;
};

const handlers: Handlers = {
  init,
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
