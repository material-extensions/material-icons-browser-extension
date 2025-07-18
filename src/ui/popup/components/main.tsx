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
import { SetStateAction, useEffect, useState } from 'react';
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

  useEffect(() => {
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
            setSuggestedProvider(match as SetStateAction<string>);
            if (match) {
              setPageSupported(true);
              setShowAddProvider(true);
            } else {
              setPageSupported(false);
            }
            break;
        }
        setIsLoading(false);
      })
      .catch(() => {
        // If there is an error, we assume the page is not supported
        setPageSupported(false);
        setIsLoading(false);
      });
  }, [domain]);

  const openOptions = () => {
    Browser.runtime.openOptionsPage();
  };

  const containerStyles: SxProps<Theme> = {
    width: '20rem',
    color: 'text.primary',
    borderRadius: 0,
    bgcolor: 'background.default',
    minHeight: '10rem',
  };

  const toolbarStyles: SxProps<Theme> = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    boxSizing: 'border-box',
  };

  const shouldShowDomainSettings =
    !isLoading && pageSupported && !showAddProvider;
  const shouldShowNotSupported =
    !isLoading && !pageSupported && !showAskForAccess;

  return (
    <Box sx={containerStyles}>
      <AppBar position='static'>
        <Toolbar sx={toolbarStyles}>
          <Logo />
          <Typography variant='h6' component='div'>
            Material Icons
          </Typography>
          <Tooltip title='Configure Domains'>
            <IconButton aria-label='Open options' onClick={openOptions}>
              <SettingsIcon style={{ color: 'white' }} />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {shouldShowDomainSettings && <DomainSettings domain={domain} />}
      {shouldShowNotSupported && <NotSupported />}
      {showAskForAccess && <AskForAccess />}
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SettingsPopup />
    </ThemeProvider>
  );
}
