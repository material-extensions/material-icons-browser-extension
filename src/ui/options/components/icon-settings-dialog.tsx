import { Domain } from '@/models';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>File Icon Bindings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FileIconBindings domain={domain} />
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Folder Icon Bindings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FolderIconBindings domain={domain} />
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Language Icon Bindings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <LanguageIconBindings domain={domain} />
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
