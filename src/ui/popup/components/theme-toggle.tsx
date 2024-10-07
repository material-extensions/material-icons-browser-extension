import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  useColorScheme,
} from '@mui/material';

export function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  if (!mode) {
    return null;
  }

  return (
    <FormControl>
      <FormLabel id='demo-theme-toggle'>Theme</FormLabel>
      <RadioGroup
        aria-labelledby='demo-theme-toggle'
        name='theme-toggle'
        row
        value={mode}
        onChange={(event) =>
          setMode(event.target.value as 'system' | 'light' | 'dark')
        }
      >
        <FormControlLabel value='system' control={<Radio />} label='System' />
        <FormControlLabel value='light' control={<Radio />} label='Light' />
        <FormControlLabel value='dark' control={<Radio />} label='Dark' />
      </RadioGroup>
    </FormControl>
  );
}
