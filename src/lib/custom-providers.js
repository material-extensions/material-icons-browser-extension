export const getCustomProviders = () => chrome.storage.sync.get('customProviders');
export const addCustomProvider = async (name, handler) => {
  const customProviders = await getCustomProviders();

  customProviders[name] = handler;

  await chrome.storage.sync.set({ customProviders });
};
