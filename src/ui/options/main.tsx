import { AppBar, Toolbar, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { getDomains } from './utils';

function Options() {
  const [domains, setDomains] = useState<string[]>([]);

  useEffect(() => {
    getDomains().then((domains) => {
      setDomains(domains);
    });
  }, []);

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: 'background.default',
        borderRadius: 0,
      }}
    >
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' component='div'>
            Material Icons
          </Typography>
        </Toolbar>
      </AppBar>

      <div>
        {domains.map((domain) => (
          <div className='domain' key={domain}>
            <input type='checkbox' className='extEnabled' />

            <h3 className='domain-name'></h3>

            <label className='domain-icon-size-label'>Icon Size:</label>
            <div className='select-wrapper'>
              <select className='iconSize'>
                <option
                  selected
                  className='default-option'
                  value="'default'"
                ></option>
                <option value='sm'>Small</option>
                <option value='md'>Medium</option>
                <option value='lg'>Large</option>
                <option value='xl'>Extra Large</option>
              </select>
            </div>

            <label className='domain-icon-pack-label'>Icon Pack:</label>
            <div className='select-wrapper'>
              <select className='iconPack'>
                <option
                  selected
                  className='default-option'
                  value="'default'"
                ></option>
                <option value='angular'>Angular</option>
                <option value='angular_ngrx'>Angular + Ngrx</option>
                <option value='react'>React</option>
                <option value='react_redux'>React + Redux</option>
                <option value='qwik'>Qwik</option>
                <option value='vue'>Vue</option>
                <option value='vue_vuex'>Vue + Vuex</option>
                <option value='nest'>Nest</option>
                <option value='none'>None</option>
              </select>
            </div>
          </div>
        ))}
      </div>
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
      <Options />
    </ThemeProvider>
  );
}
