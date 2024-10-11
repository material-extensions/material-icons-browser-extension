import { Domain } from '@/models';
import { getListOfFileIcons } from '../api/icons';
import { IconBindingControls } from './icon-binding-controls';

export function LanguageIconBindings({ domain }: { domain: Domain }) {
  return (
    <IconBindingControls
      domain={domain}
      title='Language Icon Bindings'
      iconList={getListOfFileIcons()}
      configName='languageIconBindings'
      placeholder='typescript / javascript'
      label='Language ID'
    />
  );
}
