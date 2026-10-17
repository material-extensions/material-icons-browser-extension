import InfoIcon from '@mui/icons-material/Info';
import { IconButton, Popover, Typography } from '@mui/material';
import { JSX, MouseEvent, useState } from 'react';

export function InfoButton({ infoText }: { infoText: string }) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        aria-label='More information'
        aria-describedby={open ? 'information-popover' : undefined}
        onClick={handleClick}
        color='primary'
      >
        <InfoIcon />
      </IconButton>
      <Popover
        id={open ? 'information-popover' : undefined}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Typography sx={{ p: 2 }}>{infoText}</Typography>
      </Popover>
    </>
  );
}

export function InfoPopover({
  infoText,
  renderContent,
}: {
  infoText: string;
  renderContent: () => JSX.Element;
}) {
  return (
    <div className='info-popover-layout'>
      <div className='info-popover-content'>{renderContent()}</div>
      <div className='info-popover-action'>
        <InfoButton infoText={infoText} />
      </div>
    </div>
  );
}
