import SettingsIcon from '@mui/icons-material/Settings';
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import * as React from 'react';
import Browser from 'webextension-polyfill';
import { getCurrentTab } from './helper';
import { init } from './init';

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
        borderRadius: 0,
        minHeight: '10rem',
      }}
    >
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' component='div'>
            Material Icons
          </Typography>
          <span className='toolbar-spacer'></span>
          <IconButton
            color='primary'
            aria-label='add to shopping cart'
            onClick={openOptions}
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
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
