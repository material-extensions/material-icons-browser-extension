import { IconSize } from '@/lib/icon-sizes';
import { getConfig, hardDefaults, setConfig } from '@/lib/user-config';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { IconPackValue, availableIconPacks } from 'material-icon-theme';
import { ChangeEvent, useEffect, useState } from 'react';
import { snakeToTitleCase } from '../../shared/utils';

export function DomainSettings({ domain }: { domain: string }) {
  const iconSizes: IconSize[] = ['sm', 'md', 'lg', 'xl'];
  const [extensionEnabled, setExtensionEnabled] = useState<boolean>(
    hardDefaults.extEnabled
  );
  const [iconSize, setIconSize] = useState<IconSize>(hardDefaults.iconSize);
  const [iconPack, setIconPack] = useState<IconPackValue>(
    hardDefaults.iconPack
  );

  const changeVisibility = (event: ChangeEvent<HTMLInputElement>) => {
    setConfig('extEnabled', event.target.checked);
    setExtensionEnabled(event.target.checked);
  };

  const updateIconSize = (event: SelectChangeEvent<string>) => {
    setConfig('iconSize', event.target.value as IconSize, domain);
    setIconSize(event.target.value as IconSize);
  };

  const updateIconPack = (event: SelectChangeEvent<string>) => {
    setConfig('iconPack', event.target.value, domain);
    setIconPack(event.target.value as IconPackValue);
  };

  useEffect(() => {
    getConfig<boolean>('extEnabled', domain).then((enabled) =>
      setExtensionEnabled(enabled)
    );
    getConfig<IconSize>('iconSize', domain).then((size) => setIconSize(size));
    getConfig<IconPackValue>('iconPack', domain).then((pack) =>
      setIconPack(pack)
    );
  }, []);

  return (
    <div className='domain-settings'>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox checked={extensionEnabled} onChange={changeVisibility} />
          }
          label='Enable icons'
        />
      </FormGroup>
      <FormControl fullWidth size='small'>
        <InputLabel>Icon Size</InputLabel>
        <Select
          id='select-icon-size'
          label='Icon Size'
          value={iconSize}
          onChange={updateIconSize}
        >
          {iconSizes.map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size='small'>
        <InputLabel>Icon Pack</InputLabel>
        <Select
          id='select-icon-pack'
          label='Icon Pack'
          value={iconPack}
          onChange={updateIconPack}
        >
          {availableIconPacks.map((pack) => (
            <MenuItem key={pack} value={pack}>
              {snakeToTitleCase(pack)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
