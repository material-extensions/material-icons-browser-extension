import { UserConfig, getConfig, setConfig } from '@/lib/user-config';
import { Domain } from '@/models';
import { InfoPopover } from '@/ui/shared/info-popover';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from '@mui/material';
import { IconAssociations } from 'material-icon-theme';
import { CSSProperties, useEffect, useState } from 'react';
import { WithBindingProps } from '../../types/binding-control-props';
import { BindingControls } from './binding-input-controls';
import { IconPreview } from './icon-preview';

type IconBindingControlProps = {
  title: string;
  domain: Domain;
  iconList: string[];
  configName: keyof Pick<
    UserConfig,
    'fileIconBindings' | 'folderIconBindings' | 'languageIconBindings'
  >;
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

  const iconBindingStyle: CSSProperties = {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 2rem',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
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
      <div style={controlStyling}>
        {iconBindings.map(({ binding, iconName }, index) => (
          <div key={index} style={iconBindingStyle}>
            <InfoPopover
              renderContent={() => (
                <BindingControls
                  binding={binding}
                  index={index}
                  placeholder={placeholder}
                  label={label}
                  changeBinding={changeBinding}
                  bindings={bindings}
                  bindingsLabel={bindingsLabel}
                />
              )}
              infoText={iconInfoText}
            />
            <Autocomplete
              value={iconName}
              onChange={(_, value) => {
                onChangeIconName(index, value);
              }}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <Box
                    key={key}
                    component='li'
                    sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                    {...optionProps}
                  >
                    <IconPreview configName={configName} iconName={option} />
                    {option}
                  </Box>
                );
              }}
              options={iconList}
              sx={{ width: '100%' }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment
                          position='start'
                          style={{ paddingLeft: '0.5rem' }}
                        >
                          <IconPreview
                            configName={configName}
                            iconName={iconName ?? undefined}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                  label='Icon'
                />
              )}
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
