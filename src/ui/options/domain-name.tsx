import PublicIcon from '@mui/icons-material/Public';
import { CSSProperties } from 'react';

export function DomainName({ domain }: { domain: string }) {
  const styles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    fontWeight: 600,
  };

  return (
    <div style={styles}>
      <PublicIcon />
      <span>{domain}</span>
    </div>
  );
}
