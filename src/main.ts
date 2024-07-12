import Browser from 'webextension-polyfill';
import { initIconSizes } from './lib/icon-sizes';
import { observePage, replaceAllIcons } from './lib/replace-icons';
import { getConfig, onConfigChange } from './lib/user-config';
import { Provider } from './models';
import { getGitProvider } from './providers';

interface Possibilities {
  [key: string]: string;
}

const init = (): void => {
  initIconSizes();

  const { href } = window.location;

  getGitProvider(href).then((provider: Provider | null) => {
    Promise.all([
      getConfig('iconPack'),
      getConfig('extEnabled'),
      getConfig('extEnabled', 'default'),
    ]).then(
      ([iconPack, extEnabled, globalExtEnabled]: [
        string,
        boolean,
        boolean,
      ]) => {
        if (!globalExtEnabled || !extEnabled || !provider) return;
        observePage(provider, iconPack);
        onConfigChange('iconPack', () => replaceAllIcons(provider));
      }
    );
  });
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

Browser.runtime.onMessage.addListener(
  (
    message: { cmd: keyof Handlers; args?: any[] },
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
  }
);

init();
