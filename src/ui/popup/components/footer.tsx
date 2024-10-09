import { Box, Button, Link, SxProps, Theme } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import BugReportIcon from '@mui/icons-material/BugReport';

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
      <Link href='https://github.com/material-extensions/material-icons-browser-extension'>
        GitHub
      </Link>
      <Link href='https://github.com/material-extensions/material-icons-browser-extension/issues'>
        Report Issue
      </Link>
    </Box>
  );
}
