import PublicIcon from '@mui/icons-material/Public';
import { Typography } from '@mui/material';
import { CSSProperties } from 'react';

export function DomainName({ domain }: { domain: string }) {
  const styles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    fontWeight: 600,
  };

  return (
    <Typography color='textPrimary'>
      <div style={styles}>
        <PublicIcon />
        <span>{domain}</span>
      </div>
    </Typography>
  );
}
