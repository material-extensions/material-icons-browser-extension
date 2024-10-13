import { UserConfig, getConfig, setConfig } from '@/lib/user-config';
import { Domain } from '@/models';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Autocomplete, Button, IconButton, TextField } from '@mui/material';
import { IconAssociations } from 'material-icon-theme';
import { CSSProperties, useEffect, useState } from 'react';

type IconBindingControlProps = {
  domain: Domain;
  title: string;
  iconList: string[];
  configName: keyof Pick<
    UserConfig,
    'fileIconBindings' | 'folderIconBindings' | 'languageIconBindings'
  >;
  placeholder: string;
  label: string;
  bindings?: string[];
  bindingsLabel?: string;
};

/**
 * If binding values are provided, the component will render a dropdown for selecting the binding values.
 * Therefor, the `bindings` and `bindingsLabel` props are required.
 */
type ValidatedIconBindingControlProps = IconBindingControlProps &
  (
    | { bindings: string[]; bindingsLabel: string }
    | { bindings?: undefined; bindingsLabel?: undefined }
  );

export function IconBindingControls({
  domain,
  title,
  iconList,
  configName,
  placeholder,
  label,
  bindings,
  bindingsLabel,
}: ValidatedIconBindingControlProps) {
  type IconBinding = {
    binding: string;
    iconName: string | null;
  };

  const [iconBindings, setIconBindings] = useState<IconBinding[]>([
    { binding: '', iconName: null },
  ]);

  useEffect(() => {
    getConfig(configName, domain.name).then((iconBinding) => {
      const bindings = Object.entries(iconBinding ?? []).map(
        ([binding, iconName]) => ({
          binding,
          iconName,
        })
      );
      setIconBindings(bindings);
    });
  }, []);

  const iconBindingStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  };

  const controlStyling: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  };

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
    setIconBindings([{ binding: '', iconName: null }, ...iconBindings]);
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
      <Button
        variant='contained'
        onClick={addIconBinding}
        endIcon={<AddIcon />}
        style={{ marginBottom: '1.5rem' }}
      >
        Add new binding
      </Button>
      <div style={controlStyling}>
        {iconBindings.map(({ binding, iconName }, index) => (
          <div key={index} style={iconBindingStyle}>
            {bindings ? (
              <Autocomplete
                disablePortal
                value={binding}
                onChange={(_, value) => {
                  if (value !== null) {
                    changeBinding(index, value);
                  }
                }}
                options={bindings}
                sx={{ width: 300 }}
                renderInput={(params) => (
                  <TextField {...params} label={bindingsLabel} />
                )}
              />
            ) : (
              <TextField
                label={label}
                variant='outlined'
                value={binding}
                onChange={(e) => {
                  changeBinding(index, e.target.value);
                }}
                placeholder={placeholder}
              />
            )}
            <Autocomplete
              disablePortal
              value={iconName}
              onChange={(_, value) => {
                onChangeIconName(index, value);
              }}
              options={iconList}
              sx={{ width: 300 }}
              renderInput={(params) => <TextField {...params} label='Icon' />}
            />
            <div>
              <IconButton onClick={() => removeBinding(index)}>
                <DeleteIcon />
              </IconButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
