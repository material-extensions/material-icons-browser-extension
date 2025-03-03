import { Box, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { requestAccess } from '../api/access';
import { getCurrentTab } from '../api/helper';
import Browser from 'webextension-polyfill';

export function AskForAccess() {
  const [currentTab, setCurrentTab] = useState<Browser.Tabs.Tab | null>(null);

  useEffect(() => {
    getCurrentTab().then(setCurrentTab);
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='body1'>
        This page requires access to display icons. Please click the button
        below to grant access.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          variant='contained'
          onClick={() => {
            if (currentTab) {
              requestAccess(currentTab);
            }
          }}
        >
          Grant Access
        </Button>
      </Box>
    </Box>
  );
}
