import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { availableIconPacks, IconPackValue } from 'material-icon-theme';
import { FolderTheme, folderThemes } from '@/lib/folder-theme';
import { IconSize, iconSizes } from '@/lib/icon-sizes';
import { ColorControl } from './color-control';
import { iconSizeLabels } from './icon-size-label';
import { PercentageSlider } from './percentage-slider';
import { snakeToTitleCase } from './utils';

export type AppearanceControlsProps = {
  iconSize: IconSize;
  iconPack: IconPackValue;
  folderColor: string;
  fileColor: string;
  iconSaturation: number;
  iconOpacity: number;
  folderTheme: FolderTheme;
  compact: boolean;
  changeIconSize: (value: IconSize) => void;
  changeIconPack: (value: IconPackValue) => void;
  changeFolderColor: (value: string) => void;
  changeFileColor: (value: string) => void;
  changeFolderTheme: (value: FolderTheme) => void;
  changeIconSaturation?: (value: number) => void;
  changeIconOpacity?: (value: number) => void;
  resetFolderColor?: () => void;
  resetFileColor?: () => void;
};

export function AppearanceControls({
  iconSize,
  iconPack,
  folderColor,
  fileColor,
  iconSaturation,
  iconOpacity,
  folderTheme,
  compact,
  changeIconSize,
  changeIconPack,
  changeFolderColor,
  changeFileColor,
  changeFolderTheme,
  changeIconSaturation,
  changeIconOpacity,
  resetFolderColor,
  resetFileColor,
}: AppearanceControlsProps) {
  return (
    <>
      <FormControl fullWidth size='small'>
        <InputLabel>Icon pack</InputLabel>
        <Select
          id='select-icon-pack'
          label='Icon pack'
          value={iconPack}
          onChange={(event) =>
            changeIconPack(event.target.value as IconPackValue)
          }
        >
          {availableIconPacks.map((pack) => (
            <MenuItem key={pack} value={pack}>
              {snakeToTitleCase(pack)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size='small'>
        <InputLabel>Icon size</InputLabel>
        <Select
          id='select-icon-size'
          label='Icon size'
          value={iconSize}
          onChange={(event) => changeIconSize(event.target.value as IconSize)}
        >
          {iconSizes.map((size) => (
            <MenuItem key={size} value={size}>
              {iconSizeLabels[size]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size='small'>
        <InputLabel>Folder theme</InputLabel>
        <Select
          id='select-folder-theme'
          label='Folder theme'
          value={folderTheme}
          onChange={(event) =>
            changeFolderTheme(event.target.value as FolderTheme)
          }
        >
          {folderThemes.map((theme) => (
            <MenuItem key={theme} value={theme}>
              {snakeToTitleCase(theme)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <ColorControl
        label='Folder color'
        iconName='folder.svg'
        value={folderColor}
        compact={compact}
        onChange={changeFolderColor}
        onReset={resetFolderColor}
      />
      <ColorControl
        label='File color'
        iconName='file.svg'
        value={fileColor}
        compact={compact}
        onChange={changeFileColor}
        onReset={resetFileColor}
      />
      <PercentageSlider
        label='Saturation'
        value={iconSaturation}
        onChange={changeIconSaturation}
      />
      <PercentageSlider
        label='Opacity'
        value={iconOpacity}
        onChange={changeIconOpacity}
      />
    </>
  );
}
