import { Box, Button, Typography } from '@mui/material';
import { requestAccess } from '../api/access';
import { getCurrentTab } from '../api/helper';

export function AskForAccess() {
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
            getCurrentTab().then(requestAccess);
          }}
        >
          Grant Access
        </Button>
      </Box>
    </Box>
  );
}
