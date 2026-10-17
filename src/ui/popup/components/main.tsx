import SettingsIcon from '@mui/icons-material/Settings';
import {
  AppBar,
  CssBaseline,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import { SxProps, Theme, ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import Browser from 'webextension-polyfill';
import { Logo } from '@/ui/shared/logo';
import { theme } from '@/ui/shared/theme';
import { Footer } from '../../shared/footer';
import { getCurrentTab, getDomainFromCurrentTab } from '../api/helper';
import { checkPageState, PageState } from '../api/page-state';
import { guessProvider } from '../api/provider';
import { AddProvider } from './add-provider';
import { AskForAccess } from './ask-for-access';
import { DomainSettings } from './domain-settings';
import { LoadingSpinner } from './loading-spinner';
import { NotSupported } from './not-supported';

function SettingsPopup() {
  const [domain, setDomain] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageSupported, setPageSupported] = useState<boolean>(false);
  const [showAskForAccess, setShowAskForAccess] = useState<boolean>(false);
  const [showAddProvider, setShowAddProvider] = useState<boolean>(false);
  const [suggestedProvider, setSuggestedProvider] = useState<string>('');

  useEffect(() => {
    getDomainFromCurrentTab().then((domain) => setDomain(domain));
  }, []);

  const updatePageState = () => {
    setIsLoading(true);
    setShowAskForAccess(false);
    setShowAddProvider(false);

    getCurrentTab()
      .then(checkPageState)
      .then(async (state) => {
        switch (state) {
          case PageState.Supported:
            setPageSupported(true);
            break;
          case PageState.AskForAccess:
            setShowAskForAccess(true);
            break;
          case PageState.HasAccess:
            const tab = await getCurrentTab();
            const match = await guessProvider(tab);
            setSuggestedProvider((match || '') as string);
            setPageSupported(true);
            setShowAddProvider(true);
            break;
        }
        setIsLoading(false);
      })
      .catch(() => {
        // If there is an error, we assume the page is not supported
        setPageSupported(false);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    updatePageState();
  }, [domain]);

  const openOptions = () => {
    Browser.runtime.openOptionsPage();
  };

  const containerStyles: SxProps<Theme> = {
    width: '22.5rem',
    color: 'text.primary',
    borderRadius: 0,
    bgcolor: 'background.default',
    minHeight: '10rem',
  };

  const toolbarStyles: SxProps<Theme> = {
    display: 'flex',
    gap: 1.25,
    width: '100%',
    minHeight: '3.5rem',
    alignItems: 'center',
    boxSizing: 'border-box',
  };

  const shouldShowDomainSettings =
    !isLoading && pageSupported && !showAddProvider;
  const shouldShowNotSupported =
    !isLoading && !pageSupported && !showAskForAccess;

  return (
    <Box sx={containerStyles}>
      <AppBar position='sticky' sx={{ top: 0, zIndex: 'appBar' }}>
        <Toolbar sx={toolbarStyles}>
          <Logo />
          <Typography
            variant='subtitle1'
            component='div'
            sx={{ flex: 1, fontWeight: 600 }}
          >
            Material Icons
          </Typography>
          <Tooltip title='Manage sites'>
            <IconButton aria-label='Manage sites' onClick={openOptions}>
              <SettingsIcon style={{ color: 'white' }} />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {shouldShowDomainSettings && <DomainSettings domain={domain} />}
      {shouldShowNotSupported && <NotSupported />}
      {showAskForAccess && (
        <AskForAccess onAccessGranted={() => updatePageState()} />
      )}
      {showAddProvider && (
        <AddProvider domain={domain} suggestedProvider={suggestedProvider} />
      )}
      {isLoading && <LoadingSpinner />}

      <Footer />
    </Box>
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
      <SettingsPopup />
    </ThemeProvider>
  );
}
