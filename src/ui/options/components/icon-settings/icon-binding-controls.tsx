import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, IconButton, Tooltip } from '@mui/material';
import { IconAssociations } from 'material-icon-theme';
import { useEffect, useState } from 'react';
import { getConfig, setConfig, UserConfig } from '@/lib/user-config';
import { Domain } from '@/models';
import { InfoButton } from '@/ui/shared/info-popover';
import { WithBindingProps } from '../../types/binding-control-props';
import { BindingControls } from './binding-input-controls';
import { IconPicker } from './icon-picker';

type IconBindingControlProps = {
  title: string;
  domain: Domain;
  iconList: string[];
  configName: keyof Pick<UserConfig, 'fileIconBindings' | 'folderIconBindings'>;
  placeholder: string;
  label: string;
  iconInfoText: string;
  bindings?: string[];
  bindingsLabel?: string;
};

export function IconBindingControls({
  title,
  domain,
  iconList,
  configName,
  placeholder,
  label,
  iconInfoText,
  bindings,
  bindingsLabel,
}: WithBindingProps<IconBindingControlProps>) {
  type IconBinding = {
    binding: string;
    iconName: string | null;
  };

  const [iconBindings, setIconBindings] = useState<IconBinding[]>([
    { binding: '', iconName: null },
  ]);

  useEffect(() => {
    getConfig(configName, domain.name, false).then((iconBinding) => {
      const bindings = Object.entries(iconBinding ?? []).map(
        ([binding, iconName]) => ({
          binding,
          iconName,
        })
      );
      setIconBindings(bindings);
    });
  }, []);

  const transformIconBindings = (bindings: IconBinding[]): IconAssociations => {
    return bindings.reduce((acc, { binding: fileBinding, iconName }) => {
      if (iconName === null) {
        return acc;
      }
      return {
        ...acc,
        [fileBinding]: iconName,
      };
    }, {});
  };

  const updateConfig = (bindings: IconBinding[]) => {
    setIconBindings(bindings);
    setConfig(configName, transformIconBindings(bindings), domain.name);
  };

  const changeBinding = (index: number, value: string) => {
    const newIconBindings = [...iconBindings];
    newIconBindings[index].binding = value;
    updateConfig(newIconBindings);
  };

  const onChangeIconName = (index: number, value: string | null) => {
    const newIconBindings = [...iconBindings];
    newIconBindings[index].iconName = value;
    updateConfig(newIconBindings);
  };

  const addIconBinding = () => {
    setIconBindings([...iconBindings, { binding: '', iconName: null }]);
  };

  const removeBinding = (index: number) => {
    const newIconBindings = [...iconBindings];
    newIconBindings.splice(index, 1);
    setIconBindings(newIconBindings);
    updateConfig(newIconBindings);
  };

  return (
    <div>
      <h3>{title}</h3>
      <div className='icon-binding-list'>
        {iconBindings.map(({ binding, iconName }, index) => (
          <div key={index} className='icon-binding-row'>
            <BindingControls
              binding={binding}
              index={index}
              placeholder={placeholder}
              label={label}
              changeBinding={changeBinding}
              bindings={bindings}
              bindingsLabel={bindingsLabel}
            />
            <InfoButton infoText={iconInfoText} />
            <IconPicker
              value={iconName}
              options={iconList}
              configName={configName}
              onChange={(value) => onChangeIconName(index, value)}
            />
            <div>
              <Tooltip title='Remove binding'>
                <IconButton onClick={() => removeBinding(index)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
      <Button onClick={addIconBinding} startIcon={<AddIcon />}>
        Add new binding
      </Button>
    </div>
  );
}
