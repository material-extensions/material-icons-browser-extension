import { StyledEngineProvider } from '@mui/material/styles';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import Options from './main';

ReactDOM.createRoot(document.getElementById('options') as HTMLElement).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <Options />
    </StyledEngineProvider>
  </React.StrictMode>
);
