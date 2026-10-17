import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Tooltip,
} from '@mui/material';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import Browser from 'webextension-polyfill';
import { folderColorFilter, normalizeFolderColor } from '@/lib/folder-color';
import { ColorPicker } from './color-picker';

type ColorControlProps = {
  label: string;
  iconName: string;
  value: string;
  compact: boolean;
  onChange: (value: string) => void;
  onReset?: () => void;
  disabled?: boolean;
};

export function ColorControl({
  label,
  iconName,
  value,
  compact: _compact,
  onChange,
  onReset,
  disabled = false,
}: ColorControlProps) {
  const [inputValue, setInputValue] = useState(value.toUpperCase());
  const [pickerOpen, setPickerOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => setInputValue(value.toUpperCase()), [value]);

  const commitHexValue = () => {
    if (/^#[\da-f]{6}$/i.test(inputValue)) {
      onChange(normalizeFolderColor(inputValue));
    } else {
      setInputValue(value.toUpperCase());
    }
  };

  return (
    <>
      <FormControl
        fullWidth
        size='small'
        className='folder-color-control'
        disabled={disabled}
        ref={anchorRef}
      >
        <InputLabel shrink>{label}</InputLabel>
        <OutlinedInput
          notched
          label={label}
          startAdornment={
            <InputAdornment position='start'>
              <IconButton
                className='folder-color-preview'
                size='small'
                aria-label={`Choose ${label.toLowerCase()}`}
                disabled={disabled}
                onClick={() => setPickerOpen((open) => !open)}
              >
                <img
                  src={Browser.runtime.getURL(iconName)}
                  alt=''
                  style={{ filter: folderColorFilter(value) }}
                />
              </IconButton>
            </InputAdornment>
          }
          inputComponent='input'
          inputProps={{
            className: 'folder-color-value',
            'aria-label': `${label} hex value`,
            value: inputValue,
            maxLength: 7,
            spellCheck: false,
            onChange: (event: ChangeEvent<HTMLInputElement>) =>
              setInputValue(event.target.value),
            onBlur: commitHexValue,
            onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
              if (event.key === 'Enter') {
                commitHexValue();
                event.currentTarget.blur();
              }
              if (event.key === 'Escape') {
                setInputValue(value.toUpperCase());
                event.currentTarget.blur();
              }
            },
          }}
          endAdornment={
            <Tooltip title={`Reset ${label.toLowerCase()}`}>
              <span>
                <IconButton
                  size='small'
                  aria-label={`Reset ${label.toLowerCase()}`}
                  disabled={!onReset}
                  onClick={onReset}
                >
                  <RestartAltIcon fontSize='small' />
                </IconButton>
              </span>
            </Tooltip>
          }
        />
      </FormControl>
      <ColorPicker
        anchorEl={anchorRef.current}
        label={label}
        open={pickerOpen && !disabled}
        value={value}
        onChange={onChange}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );
}
