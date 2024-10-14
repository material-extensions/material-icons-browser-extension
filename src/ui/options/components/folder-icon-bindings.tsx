import { Domain } from '@/models';
import { getListOfFolderIcons } from '../api/icons';
import { IconBindingControls } from './icon-binding-controls';

export function FolderIconBindings({ domain }: { domain: Domain }) {
  return (
    <IconBindingControls
      title='Folder Icon Bindings'
      domain={domain}
      iconInfoText='Enter the exact folder name, e.g. src.'
      iconList={getListOfFolderIcons()}
      configName='folderIconBindings'
      placeholder='src / dist'
      label='Folder name'
    />
  );
}
