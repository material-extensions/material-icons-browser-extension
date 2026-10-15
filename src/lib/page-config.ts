import { IconAssociations, IconPackValue } from 'material-icon-theme';
import Browser from 'webextension-polyfill';
import { hardDefaults } from './user-config';

export type ResolvedPageConfig = {
  iconPack: IconPackValue;
  fileBindings?: IconAssociations;
  folderBindings?: IconAssociations;
  enabled: boolean;
};

type ManagedBindings = {
  fileIconBindings?: IconAssociations;
  folderIconBindings?: IconAssociations;
};

/**
 * Read icon bindings set by browser policy (managed storage).
 * Browsers without managed storage or without a policy reject; treat that as empty.
 */
async function getManagedBindings(): Promise<ManagedBindings> {
  try {
    return (await Browser.storage.managed.get([
      'fileIconBindings',
      'folderIconBindings',
    ])) as ManagedBindings;
  } catch {
    return {};
  }
}

export async function getResolvedPageConfig(
  domain = window.location.hostname
): Promise<ResolvedPageConfig> {
  const [result, managed] = await Promise.all([
    Browser.storage.sync.get({
      [`${domain}:iconPack`]: null,
      'default:iconPack': hardDefaults.iconPack,
      [`${domain}:fileIconBindings`]: null,
      'default:fileIconBindings': hardDefaults.fileIconBindings,
      [`${domain}:folderIconBindings`]: null,
      'default:folderIconBindings': hardDefaults.folderIconBindings,
      [`${domain}:extEnabled`]: null,
      'default:extEnabled': hardDefaults.extEnabled,
    }),
    getManagedBindings(),
  ]);

  const fileBindings = (result[`${domain}:fileIconBindings`] ??
    result['default:fileIconBindings']) as IconAssociations | undefined;
  const folderBindings = (result[`${domain}:folderIconBindings`] ??
    result['default:folderIconBindings']) as IconAssociations | undefined;

  return {
    iconPack: (result[`${domain}:iconPack`] ??
      result['default:iconPack']) as IconPackValue,
    fileBindings: managed.fileIconBindings
      ? { ...managed.fileIconBindings, ...fileBindings }
      : fileBindings,
    folderBindings: managed.folderIconBindings
      ? { ...managed.folderIconBindings, ...folderBindings }
      : folderBindings,
    enabled: Boolean(
      result[`${domain}:extEnabled`] ?? result['default:extEnabled']
    ),
  };
}
