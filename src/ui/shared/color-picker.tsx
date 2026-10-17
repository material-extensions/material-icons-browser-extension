import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  ClickAwayListener,
  IconButton,
  Paper,
  Popper,
  Slider,
  TextField,
  Typography,
} from '@mui/material';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { normalizeFolderColor } from '@/lib/folder-color';

const presetColors = [
  '#90A4AE',
  '#EF5350',
  '#EC407A',
  '#AB47BC',
  '#7E57C2',
  '#5C6BC0',
  '#42A5F5',
  '#29B6F6',
  '#26C6DA',
  '#26A69A',
  '#66BB6A',
  '#9CCC65',
  '#D4E157',
  '#FFCA28',
  '#FFA726',
  '#FF7043',
  '#8D6E63',
  '#BDBDBD',
];

function hexToRgb(color: string): [number, number, number] {
  const normalized = normalizeFolderColor(color).slice(1);
  return [0, 2, 4].map((index) =>
    Number.parseInt(normalized.slice(index, index + 2), 16)
  ) as [number, number, number];
}

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue]
    .map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase();
}

type ColorPickerProps = {
  anchorEl: HTMLElement | null;
  label: string;
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
};

export function ColorPicker({
  anchorEl,
  label,
  open,
  value,
  onChange,
  onClose,
}: ColorPickerProps) {
  const [hexValue, setHexValue] = useState(value.toUpperCase());
  const [red, green, blue] = hexToRgb(value);
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => setHexValue(value.toUpperCase()), [value]);

  const setChannel = (channel: number, nextValue: number) => {
    const channels = [red, green, blue];
    channels[channel] = nextValue;
    onChange(rgbToHex(channels[0], channels[1], channels[2]));
  };

  const commitHexValue = () => {
    if (/^#[\da-f]{6}$/i.test(hexValue)) {
      onChange(hexValue.toUpperCase());
    } else {
      setHexValue(value.toUpperCase());
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      anchorEl?.focus();
    }
  };

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement='bottom-start'
      className='color-picker-popper'
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper
          ref={paperRef}
          className='color-picker-panel'
          elevation={8}
          role='dialog'
          aria-label={`Choose ${label.toLowerCase()}`}
          onKeyDown={handleKeyDown}
        >
          <Box className='color-picker-header'>
            <Typography variant='subtitle2'>{label}</Typography>
            <IconButton
              size='small'
              aria-label='Close color picker'
              onClick={onClose}
            >
              <CloseIcon fontSize='small' />
            </IconButton>
          </Box>

          <Box
            className='color-picker-current'
            style={{ backgroundColor: value }}
            aria-hidden='true'
          />

          <Box className='color-picker-swatches' aria-label='Preset colors'>
            {presetColors.map((color) => (
              <button
                key={color}
                type='button'
                className='color-picker-swatch'
                style={{ backgroundColor: color }}
                aria-label={`Use color ${color}`}
                aria-pressed={value.toUpperCase() === color}
                onClick={() => onChange(color)}
              />
            ))}
          </Box>

          <Box className='color-picker-channels'>
            {[
              ['Red', red],
              ['Green', green],
              ['Blue', blue],
            ].map(([channelLabel, channelValue], index) => (
              <Box className='color-picker-channel' key={channelLabel}>
                <Typography component='label' variant='caption'>
                  {channelLabel}
                </Typography>
                <Slider
                  size='small'
                  min={0}
                  max={255}
                  value={channelValue as number}
                  aria-label={channelLabel as string}
                  onChange={(_, nextValue) =>
                    setChannel(index, nextValue as number)
                  }
                />
                <Typography variant='caption'>{channelValue}</Typography>
              </Box>
            ))}
          </Box>

          <TextField
            fullWidth
            size='small'
            label='Hex color'
            value={hexValue}
            slotProps={{ htmlInput: { maxLength: 7, spellCheck: false } }}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setHexValue(event.target.value.toUpperCase())
            }
            onBlur={commitHexValue}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                commitHexValue();
                event.currentTarget.blur();
              }
            }}
          />
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}
