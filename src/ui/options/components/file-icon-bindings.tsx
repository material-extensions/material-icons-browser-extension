import { Domain } from '@/models';
import { getListOfFileIcons } from '../api/icons';
import { IconBindingControls } from './icon-binding-controls';

export function FileIconBindings({ domain }: { domain: Domain }) {
  return (
    <IconBindingControls
      domain={domain}
      iconList={getListOfFileIcons()}
      configName='fileIconBindings'
      placeholder='*.ts / tsconfig.json'
      label='File name or extension'
    />
  );
}
