import { Domain } from '@/models';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { FileIconBindings } from './file-icon-bindings';
import { FolderIconBindings } from './folder-icon-bindings';
import { LanguageIconBindings } from './language-icon-bindings';

type IconSettingsDialogProps = {
  show: boolean;
  domain: Domain;
  onClose: () => void;
};

export function IconSettingsDialog({
  show,
  domain,
  onClose,
}: IconSettingsDialogProps) {
  return (
    <Dialog open={show} onClose={onClose} fullWidth={true} maxWidth='lg'>
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
