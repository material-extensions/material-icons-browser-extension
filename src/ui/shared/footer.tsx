import { Box, Link, SxProps, Theme, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import Browser from 'webextension-polyfill';

export function Footer() {
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    const manifest = Browser.runtime.getManifest();
    setVersion(manifest.version);
  }, []);

  const styles: SxProps<Theme> = {
    width: '100%',
    color: 'text.primary',
    borderRadius: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '.5rem',
    padding: '1rem 0',
  };

  const linksStyles: SxProps<Theme> = {
    display: 'flex',
    justifyContent: 'center',
    gap: '.5rem',
  };

  const versionStyles: SxProps<Theme> = {
    fontSize: '0.75rem',
    color: 'text.secondary',
    opacity: 0.6,
  };

  return (
    <Box sx={styles}>
      <Box sx={linksStyles}>
        <Link
          target='_blank'
          href='https://github.com/material-extensions/material-icons-browser-extension'
        >
          GitHub
        </Link>
        <Link
          target='_blank'
          href='https://github.com/material-extensions/material-icons-browser-extension/issues'
        >
          Report Issue
        </Link>
      </Box>
      {version && <Typography sx={versionStyles}>v{version}</Typography>}
    </Box>
  );
}
