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
import { removeCustomProvider } from '@/lib/custom-providers';
import { Domain } from '@/models';
import { removeGitProvider } from '@/providers';
import { InfoPopover } from '@/ui/shared/info-popover';
import { Logo } from '@/ui/shared/logo';
import { theme } from '@/ui/shared/theme';
import { Footer } from '../../shared/footer';
import { getDomains } from '../api/domains';
import { ConfirmDialog } from './confirm-dialog';
import { DomainSettings } from './domain-settings';

function Options() {
  const [customDomains, setCustomDomains] = useState<Domain[]>([]);
  const [defaultDomain, setDefaultDomain] = useState<Domain>();
  const [initialDomains, setInitialDomains] = useState<Domain[]>([]);
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
      const initialDomainList = domains.filter(
        (domain) => !domain.isCustom && !domain.isDefault
      );
      const defaultDomain = domains.find((domain) => domain.isDefault);

      setCustomDomains(customDomainsList);
      setInitialDomains(initialDomainList);
      setDefaultDomain(defaultDomain);
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
          <div style={{ width: 'fit-content' }}>
            <InfoPopover
              infoText='The settings of the default domain will be applied to all other domains unless they are overridden.'
              renderContent={() => <h3>Default domain</h3>}
            />
          </div>
          {defaultDomain && <DomainSettings domain={defaultDomain} />}

          <h3>Other domains</h3>
          {initialDomains.map((domain) => (
            <DomainSettings domain={domain} />
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
