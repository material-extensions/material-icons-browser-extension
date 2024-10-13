import { Domain } from '@/models';
import { getListOfFolderIcons } from '../api/icons';
import { IconBindingControls } from './icon-binding-controls';

export function FolderIconBindings({ domain }: { domain: Domain }) {
  return (
    <IconBindingControls
      domain={domain}
      title='Folder Icon Bindings'
      iconList={getListOfFolderIcons()}
      configName='folderIconBindings'
      placeholder='src / dist'
      label='Folder name'
    />
  );
}