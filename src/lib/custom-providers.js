export const getCustomProviders = () => chrome.storage.sync.get('customProviders');
export const addCustomProvider = (name, handler) =>
  getCustomProviders().then((customProviders) => {
    customProviders[name] = handler;

    return chrome.storage.sync.set({ customProviders });
  });
