import { Domain } from '@/models';
import CloseIcon from '@mui/icons-material/Close';
import {
  AppBar,
  Box,
  Dialog,
  IconButton,
  Slide,
  Toolbar,
  Typography,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { CSSProperties, ReactElement, Ref, forwardRef } from 'react';
import { FileIconBindings } from './file-icon-bindings';
import { FolderIconBindings } from './folder-icon-bindings';
import { LanguageIconBindings } from './language-icon-bindings';

type IconSettingsDialogProps = {
  show: boolean;
  domain: Domain;
  onClose: () => void;
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<unknown>;
  },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />;
});

export function IconSettingsDialog({
  show,
  domain,
  onClose,
}: IconSettingsDialogProps) {
  const iconSettingStyles: CSSProperties = {
    display: 'grid',
    gap: '1.5rem',
    gridTemplateColumns: '1fr',
    padding: '1rem 0',
    boxSizing: 'border-box',
  };

  return (
    <Dialog
      fullScreen
      open={show}
      onClose={onClose}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: 'sticky' }}>
        <Toolbar>
          <IconButton
            edge='start'
            color='inherit'
            onClick={onClose}
            aria-label='close'
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
            Configure Icon Associations
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 4 }}>
        <Typography variant='h6' component='div'>
          Domain: {domain.name}
        </Typography>
        <div style={iconSettingStyles}>
          <FileIconBindings domain={domain} />
          <FolderIconBindings domain={domain} />
          <LanguageIconBindings domain={domain} />
        </div>
      </Box>
    </Dialog>
  );
}
