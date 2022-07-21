const defaults = {
  iconPack: 'react',
  iconSize: 'md',
};

export const getConfig = (config, domain = window.location.hostname) =>
  chrome.storage.sync
    .get({
      [`${domain}:${config}`]: defaults[config],
    })
    .then(({ [`${domain}:${config}`]: value }) => value)
    .catch(() => console.error('fuck'))

export const setConfig = (config, value, domain = window.location.hostname) =>
  chrome.storage.sync.set({
    [`${domain}:${config}`]: value,
  });

export const onConfigChange = (config, handler, domain = window.location.hostname) =>
  chrome.storage.onChanged.addListener((changes) => {
    const newValue = changes[`${domain}:${config}`]?.newValue;
    if (newValue) handler(newValue);
  });
