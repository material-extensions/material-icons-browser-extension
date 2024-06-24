import Browser from 'webextension-polyfill';

export const getCustomProviders = () =>
  Browser.storage.sync.get('customProviders').then((data) => data.customProviders || {});
export const addCustomProvider = (name, handler) =>
  getCustomProviders().then((customProviders) => {
    customProviders[name] = handler;

    return Browser.storage.sync.set({ customProviders });
  });
