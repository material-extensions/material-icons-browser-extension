import InfoIcon from '@mui/icons-material/Info';
import { IconButton, Popover, Typography } from '@mui/material';
import { CSSProperties, JSX, MouseEvent, useState } from 'react';

export function InfoPopover({
  infoText,
  renderContent,
}: {
  infoText: string;
  renderContent: () => JSX.Element;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const containerStyles: CSSProperties = {
    display: 'grid',
    width: '100%',
    gridTemplateColumns: '1fr 4rem',
    gap: '.5rem',
  };

  const contentStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  };

  return (
    <div style={containerStyles}>
      <div style={contentStyles}>{renderContent()}</div>
      <div style={contentStyles}>
        <IconButton onClick={handleClick} color='primary'>
          <InfoIcon />
        </IconButton>
      </div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Typography sx={{ p: 2 }}>{infoText}</Typography>
      </Popover>
    </div>
  );
}
