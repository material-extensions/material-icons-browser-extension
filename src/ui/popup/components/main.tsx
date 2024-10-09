import { Logo } from '@/ui/shared/logo';
import { theme } from '@/ui/shared/theme';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  AppBar,
  CssBaseline,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import Box from '@mui/material/Box';
import {
  SxProps,
  Theme,
  ThemeProvider,
  createTheme,
} from '@mui/material/styles';
import { useEffect, useState } from 'react';
import Browser from 'webextension-polyfill';
import { Footer } from '../../shared/footer';
import { getCurrentTab, getDomainFromCurrentTab } from '../api/helper';
import { PageState, checkPageState } from '../api/page-state';
import { guessProvider } from '../api/provider';
import { AddProvider } from './add-provider';
import { AskForAccess } from './ask-for-access';
import { DomainName } from './domain-name';
import { DomainSettings } from './domain-settings';
import { NotSupported } from './not-supported';

function SettingsPopup() {
  const [domain, setDomain] = useState<string>('');
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
            setSuggestedProvider(match);
            if (match) {
              setPageSupported(true);
              setShowAddProvider(true);
            } else {
              setPageSupported(false);
            }
            break;
        }
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

      {pageSupported && !showAddProvider && <DomainName domain={domain} /> && (
        <DomainSettings domain={domain} />
      )}
      {!pageSupported && !showAskForAccess && <NotSupported />}
      {showAskForAccess && <AskForAccess />}
      {showAddProvider && (
        <AddProvider domain={domain} suggestedProvider={suggestedProvider} />
      )}
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
