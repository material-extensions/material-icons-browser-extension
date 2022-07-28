const hardDefaults = {
  iconPack: 'react',
  iconSize: 'md',
  extEnabled: true,
};

export const getConfig = (config, domain = window.location.hostname, useDefault = true) =>
  new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        // get custom domain config (if not getting default).
        [`${domain !== 'default' ? domain : 'SKIP'}:${config}`]: null,
        // also get user default as fallback
        [`default:${config}`]: hardDefaults[config],
      },
      ({ [`${domain}:${config}`]: value, [`default:${config}`]: fallback }) =>
        resolve(value ?? (useDefault ? fallback : null))
    );
  });

export const setConfig = (config, value, domain = window.location.hostname) =>
  chrome.storage.sync.set({
    [`${domain}:${config}`]: value,
  });

export const clearConfig = (config, domain = window.location.hostname) =>
  new Promise((resolve) => {
    chrome.storage.sync.remove(`${domain}:${config}`, resolve);
  });

export const onConfigChange = (config, handler, domain = window.location.hostname) =>
  chrome.storage.onChanged.addListener(
    (changes) =>
      changes[`${domain}:${config}`]?.newValue !== undefined &&
      handler(changes[`${domain}:${config}`]?.newValue)
  );
