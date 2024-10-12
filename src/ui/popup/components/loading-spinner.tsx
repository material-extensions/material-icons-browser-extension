import { CircularProgress, useTheme } from '@mui/material';
import { CSSProperties } from 'react';

export function LoadingSpinner() {
  const theme = useTheme();

  const containerStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    padding: '2.5rem 0 0 0',
    boxSizing: 'border-box',
    fontSize: '1rem',
    lineHeight: '1.5',
  };

  return (
    <div className='loading-spinner' style={containerStyles}>
      <CircularProgress
        style={{ fontSize: '2rem', color: theme.palette.warning.main }}
      />
      <p>Loading...</p>
    </div>
  );
}
