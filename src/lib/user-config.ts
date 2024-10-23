import { IconAssociations, IconPackValue } from 'material-icon-theme';
import Browser from 'webextension-polyfill';
import { IconSize } from './icon-sizes';

export type UserConfig = {
  iconPack: IconPackValue;
  iconSize: IconSize;
  extEnabled: boolean;
  fileIconBindings?: IconAssociations;
  folderIconBindings?: IconAssociations;
  languageIconBindings?: IconAssociations;
};

export const hardDefaults: UserConfig = {
  iconPack: 'react',
  iconSize: 'md',
  extEnabled: true,
  fileIconBindings: {},
  folderIconBindings: {},
  languageIconBindings: {},
};

type ConfigValueType<T extends keyof UserConfig> = UserConfig[T];

export const getConfig = async <T extends keyof UserConfig>(
  configName: T,
  domain = window.location.hostname,
  useDefault = true
): Promise<ConfigValueType<T>> => {
  const keys = {
    [`${domain !== 'default' ? domain : 'SKIP'}:${configName}`]: null,
    [`default:${configName}`]: hardDefaults[configName],
  };

  const result = await Browser.storage.sync.get(keys);
  const domainSpecificValue = result[`${domain}:${configName}`];
  const defaultValue = result[`default:${configName}`];

  return domainSpecificValue ?? (useDefault ? defaultValue : null);
};

export const setConfig = <T extends keyof UserConfig>(
  configName: T,
  value: ConfigValueType<T>,
  domain = window.location.hostname
) => {
  Browser.storage.sync.set({
    [`${domain}:${configName}`]: value,
  });
};

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
