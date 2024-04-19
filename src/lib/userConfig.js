import Browser from 'webextension-polyfill';

const hardDefaults = {
  iconPack: 'react',
  iconSize: 'md',
  extEnabled: true,
};

export const getConfig = (config, domain = window.location.hostname, useDefault = true) =>
  Browser.storage.sync
    .get({
      // get custom domain config (if not getting default).
      [`${domain !== 'default' ? domain : 'SKIP'}:${config}`]: null,
      // also get user default as fallback
      [`default:${config}`]: hardDefaults[config],
    })
    .then(
      ({ [`${domain}:${config}`]: value, [`default:${config}`]: fallback }) =>
        value ?? (useDefault ? fallback : null)
    );

export const setConfig = (config, value, domain = window.location.hostname) =>
  Browser.storage.sync.set({
    [`${domain}:${config}`]: value,
  });

export const clearConfig = (config, domain = window.location.hostname) =>
  Browser.storage.sync.remove(`${domain}:${config}`);

export const onConfigChange = (config, handler, domain = window.location.hostname) =>
  Browser.storage.onChanged.addListener(
    (changes) =>
      changes[`${domain}:${config}`]?.newValue !== undefined &&
      handler(changes[`${domain}:${config}`]?.newValue)
  );
