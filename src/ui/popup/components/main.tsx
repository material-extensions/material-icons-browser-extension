import SettingsIcon from '@mui/icons-material/Settings';
import {
  AppBar,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import * as React from 'react';
import Browser from 'webextension-polyfill';
import { getCurrentTab } from '../api/helper';
import { init } from '../api/init';
import { DomainSettings } from './domain-settings';

function SettingsPopup() {
  React.useEffect(() => {
    getCurrentTab().then(init);
  }, []);

  const openOptions = () => {
    Browser.runtime.openOptionsPage();
  };

  return (
    <Box
      sx={{
        width: '20rem',
        bgcolor: 'background.default',
        color: 'text.primary',
        borderRadius: 0,
        minHeight: '30rem',
      }}
    >
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' component='div'>
            Material Icons
          </Typography>
          <span className='toolbar-spacer'></span>
          <Tooltip title='Configure Domains'>
            <IconButton
              color='primary'
              aria-label='add to shopping cart'
              onClick={openOptions}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <DomainSettings />
    </Box>
  );
}

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

export default function Main() {
  return (
    <ThemeProvider theme={theme}>
      <SettingsPopup />
    </ThemeProvider>
  );
}
