import { IconAssociations, IconPackValue } from 'material-icon-theme';
import Browser from 'webextension-polyfill';
import { normalizeFolderColor } from './folder-color';
import { FolderTheme, normalizeFolderTheme } from './folder-theme';
import { hardDefaults } from './user-config';

export type ResolvedPageConfig = {
  iconPack: IconPackValue;
  fileBindings?: IconAssociations;
  folderBindings?: IconAssociations;
  folderColor: string;
  fileColor: string;
  folderTheme: FolderTheme;
  enabled: boolean;
};

export async function getResolvedPageConfig(
  domain = window.location.hostname
): Promise<ResolvedPageConfig> {
  const result = await Browser.storage.sync.get({
    [`${domain}:iconPack`]: null,
    'default:iconPack': hardDefaults.iconPack,
    [`${domain}:fileIconBindings`]: null,
    'default:fileIconBindings': hardDefaults.fileIconBindings,
    [`${domain}:folderIconBindings`]: null,
    'default:folderIconBindings': hardDefaults.folderIconBindings,
    [`${domain}:folderColor`]: null,
    'default:folderColor': hardDefaults.folderColor,
    [`${domain}:fileColor`]: null,
    'default:fileColor': hardDefaults.fileColor,
    [`${domain}:folderTheme`]: null,
    'default:folderTheme': hardDefaults.folderTheme,
    [`${domain}:extEnabled`]: null,
    'default:extEnabled': hardDefaults.extEnabled,
  });

  return {
    iconPack: (result[`${domain}:iconPack`] ??
      result['default:iconPack']) as IconPackValue,
    fileBindings: (result[`${domain}:fileIconBindings`] ??
      result['default:fileIconBindings']) as IconAssociations | undefined,
    folderBindings: (result[`${domain}:folderIconBindings`] ??
      result['default:folderIconBindings']) as IconAssociations | undefined,
    folderColor: normalizeFolderColor(
      result[`${domain}:folderColor`] ?? result['default:folderColor']
    ),
    fileColor: normalizeFolderColor(
      result[`${domain}:fileColor`] ?? result['default:fileColor']
    ),
    folderTheme: normalizeFolderTheme(
      result[`${domain}:folderTheme`] ?? result['default:folderTheme']
    ),
    enabled: Boolean(
      result[`${domain}:extEnabled`] ?? result['default:extEnabled']
    ),
  };
}
