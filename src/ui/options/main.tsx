import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Footer } from '../shared/footer';
import { DomainSettings } from './domain-settings';
import { getDomains } from './utils';

function Options() {
  const [domains, setDomains] = useState<string[]>([]);

  useEffect(() => {
    getDomains().then((domains) => {
      setDomains(domains);
    });
  }, []);

  const resetAll = async () => {
    const event = new CustomEvent('RESET_ALL_DOMAINS');
    window.dispatchEvent(event);
  };

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        bgcolor: 'background.default',
        borderRadius: 0,
      }}
    >
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' component='div'>
            Material Icons
          </Typography>
          <span className='toolbar-spacer'></span>
          <Button onClick={resetAll}>Reset all</Button>
        </Toolbar>
      </AppBar>

      {domains.map((domain) => (
        <DomainSettings domain={domain} />
      ))}

      <Footer />
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
      <Options />
    </ThemeProvider>
  );
}
