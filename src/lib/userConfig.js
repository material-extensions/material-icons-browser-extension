const hardDefaults = {
  iconPack: 'react',
  iconSize: 'md',
};

export const getConfig = (config, domain = window.location.hostname, useDefault = true) =>
  chrome.storage.sync
    .get({
      // get custom domain config (if not getting default).
      [`${domain !== 'default' ? domain : 'SKIP'}:${config}`]: null,
      // also get user default as fallback
      [`default:${config}`]: hardDefaults[config],
    })
    .then(
      ({ [`${domain}:${config}`]: value, [`default:${config}`]: fallback }) => value ?? (useDefault ? fallback : null)
    );

export const setConfig = (config, value, domain = window.location.hostname) =>
  chrome.storage.sync.set({
    [`${domain}:${config}`]: value,
  });

export const onConfigChange = (config, handler, domain = window.location.hostname) =>
  chrome.storage.onChanged.addListener((changes) => {
    const newValue = changes[`${domain}:${config}`]?.newValue;
    if (newValue) handler(newValue);
  });
