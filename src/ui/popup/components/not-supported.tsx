import { CSSProperties } from 'react';
import WarningIcon from '@mui/icons-material/Warning';

export function NotSupported() {
  const containerStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    padding: '2rem',
    boxSizing: 'border-box',
    fontSize: '1rem',
    lineHeight: '1.5',
  };
  return (
    <div className='not-supported' style={containerStyles}>
      <WarningIcon style={{ fontSize: '2rem' }} />
      <h3>Not Supported</h3>
      <p style={{ margin: 0 }}>
        This page is not supported by the extension. You can still use the
        extension on other pages.
      </p>
    </div>
  );
}
