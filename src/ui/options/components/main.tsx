import { theme } from '@/ui/shared/theme';
import {
  AppBar,
  Button,
  CssBaseline,
  Toolbar,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Footer } from '../../shared/footer';
import { getDomains } from '../api/domains';
import { DomainSettings } from './domain-settings';

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
        color: 'text.primary',
      }}
    >
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' component='div'>
            Material Icons
          </Typography>
          <span className='toolbar-spacer'></span>
          <Button onClick={resetAll} sx={{ color: 'white' }}>
            Reset all
          </Button>
        </Toolbar>
      </AppBar>

      {domains.map((domain) => (
        <DomainSettings domain={domain} />
      ))}

      <Footer />
    </Box>
  );
}

export default function Main() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Options />
    </ThemeProvider>
  );
}
