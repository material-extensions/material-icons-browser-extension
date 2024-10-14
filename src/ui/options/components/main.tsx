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
import { ConfirmDialog } from './confirm-dialog';
import { DomainSettings } from './domain-settings';

function Options() {
  const [customDomains, setCustomDomains] = useState<Domain[]>([]);
  const [defaultDomains, setDefaultDomains] = useState<Domain[]>([]);
  const [showResetConfirmDialog, setShowResetConfirmDialog] = useState(false);

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
    width: '100%',
    bgcolor: 'background.default',
    borderRadius: 0,
    color: 'text.primary',
  };
  return (
    <>
      <Box sx={containerStyling}>
        <AppBar position='sticky'>
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
            <Button
              onClick={() => setShowResetConfirmDialog(true)}
              sx={{ color: 'white' }}
            >
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

      {/* Dialogs */}

      <ConfirmDialog
        title='Reset all domains'
        message={`Are you sure to reset all domain settings to the settings of the default domain? It will also put the icon bindings to the default domain.`}
        onConfirm={() => {
          resetAll();
          setShowResetConfirmDialog(false);
        }}
        onCancel={() => {
          setShowResetConfirmDialog(false);
        }}
        show={showResetConfirmDialog}
      />
    </>
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
