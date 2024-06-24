import Browser from 'webextension-polyfill';
import { getGitProvider } from './providers';
import { observePage, replaceAllIcons } from './lib/replace-icons';
import { initIconSizes } from './lib/icon-sizes';
import { getConfig, onConfigChange } from './lib/userConfig';

function init() {
  initIconSizes();

  const { href } = window.location;

  getGitProvider(href).then((gitProvider) => {
    Promise.all([
      getConfig('iconPack'),
      getConfig('extEnabled'),
      getConfig('extEnabled', 'default'),
    ]).then(([iconPack, extEnabled, globalExtEnabled]) => {
      if (!globalExtEnabled || !extEnabled || !gitProvider) return;
      observePage(gitProvider, iconPack);
      onConfigChange('iconPack', (newIconPack) => replaceAllIcons(gitProvider, newIconPack));
    });
  });
}

const handlers = {
  init,

  guessProvider(possibilities) {
    for (const [name, selector] of Object.entries(possibilities)) {
      if (document.querySelector(selector)) {
        return name;
      }
    }

    return null;
  },
};

Browser.runtime.onMessage.addListener((message, sender, response) => {
  if (!handlers[message.cmd]) {
    return response(null);
  }

  const result = handlers[message.cmd].apply(null, message.args || []);

  return response(result);
});

init();
