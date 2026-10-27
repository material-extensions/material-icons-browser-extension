import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  Box,
  ClickAwayListener,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  OutlinedInput,
  Paper,
  Popper,
  TextField,
} from '@mui/material';
import { KeyboardEvent, useId, useMemo, useRef, useState } from 'react';
import { UserConfig } from '@/lib/user-config';
import { IconPreview } from './icon-preview';

type IconPickerProps = {
  value: string | null;
  options: string[];
  configName: keyof Pick<UserConfig, 'fileIconBindings' | 'folderIconBindings'>;
  onChange: (value: string | null) => void;
};

export function IconPicker({
  value,
  options,
  configName,
  onChange,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const anchorRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery
      ? options.filter((option) =>
          option.toLowerCase().includes(normalizedQuery)
        )
      : options;
  }, [options, query]);

  const showPicker = () => {
    setOpen(true);
    setActiveIndex(Math.max(0, filteredOptions.indexOf(value ?? '')));
  };

  const closePicker = () => {
    setOpen(false);
    setQuery('');
    setActiveIndex(-1);
  };

  const selectIcon = (iconName: string | null) => {
    onChange(iconName);
    closePicker();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!open && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      showPicker();
      return;
    }

    if (!open) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closePicker();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) =>
        Math.min(current + 1, filteredOptions.length - 1)
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectIcon(filteredOptions[activeIndex]);
    }
  };

  return (
    <ClickAwayListener onClickAway={closePicker}>
      <Box className='icon-picker' onKeyDown={handleKeyDown}>
        <FormControl fullWidth ref={anchorRef}>
          <InputLabel shrink>Icon</InputLabel>
          <OutlinedInput
            notched
            label='Icon'
            value={value ?? ''}
            readOnly
            role='combobox'
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-haspopup='listbox'
            onClick={() => (open ? closePicker() : showPicker())}
            startAdornment={
              value ? (
                <InputAdornment position='start'>
                  <IconPreview configName={configName} iconName={value} />
                </InputAdornment>
              ) : undefined
            }
            endAdornment={
              <InputAdornment position='end'>
                <IconButton
                  aria-label={open ? 'Close icon picker' : 'Open icon picker'}
                  edge='end'
                  tabIndex={-1}
                >
                  <ArrowDropDownIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement='bottom-start'
          className='icon-picker-popper'
          style={{ width: anchorRef.current?.clientWidth }}
        >
          <Paper className='icon-picker-menu' elevation={8}>
            <TextField
              className='icon-picker-search'
              size='small'
              fullWidth
              placeholder='Search icons…'
              aria-label='Search icons'
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={(event) => event.stopPropagation()}
            />
            <List id={listId} role='listbox' dense disablePadding>
              {filteredOptions.map((option, index) => (
                <ListItemButton
                  key={option}
                  role='option'
                  selected={option === value || index === activeIndex}
                  aria-selected={option === value}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectIcon(option)}
                >
                  <ListItemIcon>
                    <IconPreview configName={configName} iconName={option} />
                  </ListItemIcon>
                  <ListItemText primary={option} />
                </ListItemButton>
              ))}
              {filteredOptions.length === 0 && (
                <Box className='icon-picker-empty'>No matching icons</Box>
              )}
            </List>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
