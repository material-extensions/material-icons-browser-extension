import { IconSize, iconSizes } from '@/lib/icon-sizes';
import { hardDefaults } from '@/lib/user-config';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { IconPackValue, availableIconPacks } from 'material-icon-theme';
import { snakeToTitleCase } from './utils';

type DomainSettingsControls = {
  extensionEnabled: boolean;
  iconSize: IconSize | undefined;
  iconPack: IconPackValue | undefined;
  changeVisibility: (visible: boolean) => void;
  changeIconSize: (iconSize: IconSize) => void;
  changeIconPack: (iconPack: IconPackValue) => void;
};

export function DomainSettingsControls({
  extensionEnabled,
  iconSize,
  iconPack,
  changeVisibility,
  changeIconSize,
  changeIconPack,
}: DomainSettingsControls) {
  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={extensionEnabled ?? hardDefaults.extEnabled}
            onChange={(e) => changeVisibility(e.target.checked)}
          />
        }
        label='Enable icons'
      />
      <FormControl fullWidth size='small'>
        <InputLabel>Icon Size</InputLabel>
        <Select
          id='select-icon-size'
          label='Icon Size'
          value={iconSize}
          onChange={(e) => changeIconSize(e.target.value as IconSize)}
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
          onChange={(e) => changeIconPack(e.target.value as IconPackValue)}
        >
          {availableIconPacks.map((pack) => (
            <MenuItem key={pack} value={pack}>
              {snakeToTitleCase(pack)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}
