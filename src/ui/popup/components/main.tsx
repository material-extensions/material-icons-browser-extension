import SettingsIcon from '@mui/icons-material/Settings';
import {
  AppBar,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
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

  const styles: SxProps<Theme> = {
    width: '20rem',
    bgcolor: 'background.default',
    color: 'text.primary',
    borderRadius: 0,
    minHeight: '10rem',
  };
  return (
    <Box sx={styles}>
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' component='div'>
            Material Icons
          </Typography>
          <span className='toolbar-spacer'></span>
          <Tooltip title='Configure Domains'>
            <IconButton
              color='primary'
              aria-label='add to shopping cart'
              onClick={openOptions}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {pageSupported && <DomainName domain={domain} /> && (
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
