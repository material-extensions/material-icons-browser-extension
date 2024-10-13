import { UserConfig, getConfig, setConfig } from '@/lib/user-config';
import { Domain } from '@/models';
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
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <Box
                    key={key}
                    component='li'
                    sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                    {...optionProps}
                  >
                    <IconOption
                      iconName={
                        configName === 'folderIconBindings'
                          ? option === 'folder'
                            ? 'folder'
                            : `folder-${option}`
                          : option
                      }
                    />
                    {option}
                  </Box>
                );
              }}
              options={iconList}
              sx={{ width: 300 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position='start'>
                          <IconOption
                            iconName={
                              configName === 'folderIconBindings'
                                ? iconName === 'folder'
                                  ? 'folder'
                                  : `folder-${iconName}`
                                : iconName
                            }
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
    </div>
  );
}

function IconOption({ iconName }: { iconName: string | null }) {
  return (
    <img
      loading='lazy'
      width='20'
      src={`./${iconName?.toLowerCase()}.svg`}
      alt=''
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null; // Prevent infinite loop in case the fallback also fails
        target.src = `./${iconName?.toLowerCase()}.clone.svg`;
      }}
    />
  );
}
