import { Domain } from '@/models';
import { getListOfFileIcons } from '../api/icons';
import { IconBindingControls } from './icon-binding-controls';

export function FileIconBindings({ domain }: { domain: Domain }) {
  return (
    <IconBindingControls
      title='File Icon Bindings'
      domain={domain}
      iconInfoText='Enter a file extension (e.g., *.ts) or a file name (e.g., tsconfig.json).'
      iconList={getListOfFileIcons()}
      configName='fileIconBindings'
      placeholder='*.ts / tsconfig.json'
      label='File name or extension'
    />
  );
}
