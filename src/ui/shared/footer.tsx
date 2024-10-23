import { Box, Link, SxProps, Theme } from '@mui/material';

export function Footer() {
  const styles: SxProps<Theme> = {
    width: '100%',
    color: 'text.primary',
    borderRadius: 0,
    display: 'flex',
    justifyContent: 'center',
    gap: '.5rem',
    padding: '1rem 0',
  };

  return (
    <Box sx={styles}>
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
  );
}
