import { removeCustomProvider } from '@/lib/custom-providers';
import { Domain } from '@/models';
import { removeGitProvider } from '@/providers';
import { Logo } from '@/ui/shared/logo';
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
  const [customDomains, setCustomDomains] = useState<Domain[]>([]);
  const [defaultDomains, setDefaultDomains] = useState<Domain[]>([]);

  useEffect(() => {
    updateDomains();
  }, []);

  const resetAll = async () => {
    const event = new CustomEvent('RESET_ALL_DOMAINS');
    window.dispatchEvent(event);
  };

  const updateDomains = () => {
    return getDomains().then((domains) => {
      const customDomainsList = domains.filter((domain) => domain.isCustom);
      const defaultDomainsList = domains.filter((domain) => !domain.isCustom);

      setCustomDomains(customDomainsList);
      setDefaultDomains(defaultDomainsList);
    });
  };

  const deleteDomain = async (domain: Domain) => {
    await removeCustomProvider(domain.name);
    await removeGitProvider(domain.name);
    await updateDomains();
  };

  const containerStyling = {
    width: '100vw',
    minHeight: '100vh',
    bgcolor: 'background.default',
    borderRadius: 0,
    color: 'text.primary',
  };
  return (
    <Box sx={containerStyling}>
      <AppBar position='static'>
        <Toolbar>
          <Logo />
          <Typography
            variant='h6'
            component='div'
            style={{ paddingLeft: '.5rem' }}
          >
            Material Icons
          </Typography>
          <span className='toolbar-spacer'></span>
          <Button onClick={resetAll} sx={{ color: 'white' }}>
            Reset all
          </Button>
        </Toolbar>
      </AppBar>

      <Box p={4}>
        <h3>Default domains</h3>
        {defaultDomains.map((domain) => (
          <DomainSettings
            domain={domain}
            deleteDomain={() => deleteDomain(domain)}
          />
        ))}

        {customDomains.length > 0 && <h3>Custom domains</h3>}
        {customDomains.map((domain) => (
          <DomainSettings
            domain={domain}
            deleteDomain={() => deleteDomain(domain)}
          />
        ))}
      </Box>

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
