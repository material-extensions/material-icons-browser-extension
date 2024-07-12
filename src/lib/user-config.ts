import Browser from 'webextension-polyfill';

export type UserConfig = {
  iconPack: string;
  iconSize: string;
  extEnabled: boolean;
};

const hardDefaults: UserConfig = {
  iconPack: 'react',
  iconSize: 'md',
  extEnabled: true,
};

export const getConfig = (
  configName: keyof UserConfig,
  domain = window.location.hostname,
  useDefault = true
) =>
  Browser.storage.sync
    .get({
      // get custom domain config (if not getting default).
      [`${domain !== 'default' ? domain : 'SKIP'}:${configName}`]: null,
      // also get user default as fallback
      [`default:${configName}`]: hardDefaults[configName],
    })
    .then(
      ({
        [`${domain}:${configName}`]: value,
        [`default:${configName}`]: fallback,
      }) => value ?? (useDefault ? fallback : null)
    );

export const setConfig = (
  configName: keyof UserConfig,
  value: unknown,
  domain = window.location.hostname
) =>
  Browser.storage.sync.set({
    [`${domain}:${configName}`]: value,
  });

export const clearConfig = (
  configName: keyof UserConfig,
  domain = window.location.hostname
) => Browser.storage.sync.remove(`${domain}:${configName}`);

export const addConfigChangeListener = (
  configName: keyof UserConfig,
  handler: Function,
  domain = window.location.hostname
) =>
  Browser.storage.onChanged.addListener(
    (changes) =>
      changes[`${domain}:${configName}`]?.newValue !== undefined &&
      handler(changes[`${domain}:${configName}`]?.newValue)
  );
