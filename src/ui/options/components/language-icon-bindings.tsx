import { Domain } from '@/models';
import { getListOfFileIcons } from '../api/icons';
import { getLanguageIds } from '../api/language-ids';
import { IconBindingControls } from './icon-binding-controls';

export function LanguageIconBindings({ domain }: { domain: Domain }) {
  return (
    <IconBindingControls
      title='Language Icon Bindings'
      domain={domain}
      iconInfoText='You can select a language ID from the dropdown list. The list shows all language IDs that are supported at the moment.'
      iconList={getListOfFileIcons()}
      bindings={getLanguageIds()}
      bindingsLabel='Language ID'
      configName='languageIconBindings'
      placeholder='typescript / javascript'
      label='Language ID'
    />
  );
}
