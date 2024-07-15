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

export const getConfig = async <T = unknown>(
  configName: keyof UserConfig,
  domain = window.location.hostname,
  useDefault = true
): Promise<T> => {
  const keys = {
    [`${domain !== 'default' ? domain : 'SKIP'}:${configName}`]: null,
    [`default:${configName}`]: hardDefaults[configName],
  };

  const result = await Browser.storage.sync.get(keys);
  const domainSpecificValue = result[`${domain}:${configName}`];
  const defaultValue = result[`default:${configName}`];

  return domainSpecificValue ?? (useDefault ? defaultValue : null);
};

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
