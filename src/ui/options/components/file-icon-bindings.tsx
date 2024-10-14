import { Domain } from '@/models';
import { getListOfFileIcons } from '../api/icons';
import { IconBindingControls } from './icon-binding-controls';

export function FileIconBindings({ domain }: { domain: Domain }) {
  return (
    <IconBindingControls
      title='File Icon Bindings'
      domain={domain}
      iconInfoText='You can enter a file extension or a file name. The file extension should start with an asterisk (*), e.g. *.ts. If all file names with the same file extension shall be overridden, the please use two asterisks, e.g. **.ts. The file name must be the exact name of the file, e.g. tsconfig.json.'
      iconList={getListOfFileIcons()}
      configName='fileIconBindings'
      placeholder='*.ts / tsconfig.json'
      label='File name or extension'
    />
  );
}
