import { Domain } from '@/models';
import { getListOfFileIcons } from '../api/icons';
import { getLanguageIds } from '../api/language-ids';
import { IconBindingControls } from './icon-binding-controls';

export function LanguageIconBindings({ domain }: { domain: Domain }) {
  return (
    <IconBindingControls
      domain={domain}
      iconList={getListOfFileIcons()}
      bindings={getLanguageIds()}
      bindingsLabel='Language ID'
      configName='languageIconBindings'
      placeholder='typescript / javascript'
      label='Language ID'
    />
  );
}
