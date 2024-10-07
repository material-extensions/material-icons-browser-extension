import { StyledEngineProvider } from '@mui/material/styles';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import SettingsPopup from './components/main';

ReactDOM.createRoot(
  document.getElementById('settings-popup') as HTMLElement
).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <SettingsPopup />
    </StyledEngineProvider>
  </React.StrictMode>
);
