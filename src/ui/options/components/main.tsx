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

        <main className='options-content'>
          <section
            className='options-section'
            aria-labelledby='default-heading'
          >
            <Box className='options-section-heading'>
              <InfoPopover
                infoText='The default settings apply to every site unless that site has its own overrides.'
                renderContent={() => (
                  <h2 id='default-heading'>Default settings</h2>
                )}
              />
              <p>Applied to sites that do not have custom settings.</p>
            </Box>
            <Box className='domain-list'>
              {defaultDomain && <DomainSettings domain={defaultDomain} />}
            </Box>
          </section>

          <section className='options-section' aria-labelledby='sites-heading'>
            <Box className='options-section-heading'>
              <h2 id='sites-heading'>Supported sites</h2>
              <p>Expand a site to override its default appearance.</p>
            </Box>
            <Box className='domain-list'>
              {initialDomains.map((domain) => (
                <DomainSettings key={domain.name} domain={domain} />
              ))}
            </Box>
          </section>

          {customDomains.length > 0 && (
            <section
              className='options-section'
              aria-labelledby='custom-heading'
            >
              <Box className='options-section-heading'>
                <h2 id='custom-heading'>Custom sites</h2>
                <p>Sites added through the extension popup.</p>
              </Box>
              <Box className='domain-list'>
                {customDomains.map((domain) => (
                  <DomainSettings
                    key={domain.name}
                    domain={domain}
                    deleteDomain={() => deleteDomain(domain)}
                  />
                ))}
              </Box>
            </section>
          )}
        </main>

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
    <ThemeProvider
      theme={theme}
      defaultMode='system'
      storageManager={null}
      noSsr
    >
      <CssBaseline enableColorScheme />
      <Options />
    </ThemeProvider>
  );
}
