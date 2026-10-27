import { IconAssociations, IconPackValue } from 'material-icon-theme';
import Browser from 'webextension-polyfill';
import { DEFAULT_FOLDER_COLOR } from './folder-color';
import { FolderTheme } from './folder-theme';
import { IconSize } from './icon-sizes';

export type UserConfig = {
  iconPack: IconPackValue;
  iconSize: IconSize;
  iconSaturation: number;
  iconOpacity: number;
  extEnabled: boolean;
  folderColor: string;
  fileColor: string;
  folderTheme: FolderTheme;
  fileIconBindings?: IconAssociations;
  folderIconBindings?: IconAssociations;
};

export const hardDefaults: UserConfig = {
  iconPack: 'react',
  iconSize: 'md',
  iconSaturation: 100,
  iconOpacity: 100,
  extEnabled: true,
  folderColor: DEFAULT_FOLDER_COLOR,
  fileColor: DEFAULT_FOLDER_COLOR,
  folderTheme: 'specific',
  fileIconBindings: {},
  folderIconBindings: {},
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

  return (domainSpecificValue ??
    (useDefault ? defaultValue : null)) as ConfigValueType<T>;
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
