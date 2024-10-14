import { Domain } from '@/models';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  Typography,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { ReactElement, Ref, forwardRef } from 'react';
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
  return (
    <Dialog
      open={show}
      onClose={onClose}
      TransitionComponent={Transition}
      fullWidth={true}
      maxWidth='lg'
    >
      <DialogTitle>Configure Icon Bindings</DialogTitle>
      <DialogContent>
        <Typography component='div' style={{ paddingBottom: '1.5rem' }}>
          Domain: {domain.name}
        </Typography>

        <FileIconBindings domain={domain} />
        <FolderIconBindings domain={domain} />
        <LanguageIconBindings domain={domain} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
