import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { IconPackValue } from 'material-icon-theme';
import { FolderTheme } from '@/lib/folder-theme';
import { IconSize } from '@/lib/icon-sizes';
import { hardDefaults } from '@/lib/user-config';
import {
  AppearanceControls,
  AppearanceControlsProps,
} from './appearance-controls';
import { iconSizeLabels } from './icon-size-label';
import { snakeToTitleCase } from './utils';

type DomainSettingsControlsProps = {
  extensionEnabled: boolean;
  visibilityChanging?: boolean;
  visibilityRefreshRequired?: boolean;
  refreshPage?: () => void;
  iconSize: IconSize | undefined;
  iconPack: IconPackValue | undefined;
  folderColor: string | undefined;
  fileColor: string | undefined;
  folderTheme?: FolderTheme;
  iconSaturation?: number;
  iconOpacity?: number;
  changeVisibility: (visible: boolean) => void;
  changeIconSize: (iconSize: IconSize) => void;
  changeIconPack: (iconPack: IconPackValue) => void;
  changeFolderColor: (folderColor: string) => void;
  changeFileColor: (fileColor: string) => void;
  changeFolderTheme: (folderTheme: FolderTheme) => void;
  changeIconSaturation?: (value: number) => void;
  changeIconOpacity?: (value: number) => void;
  compact?: boolean;
  domain?: string;
  resetFolderColor?: () => void;
  resetFileColor?: () => void;
};

export function DomainSettingsControls({
  extensionEnabled,
  visibilityChanging = false,
  visibilityRefreshRequired = false,
  refreshPage,
  iconSize = hardDefaults.iconSize,
  iconPack = hardDefaults.iconPack,
  folderColor = hardDefaults.folderColor,
  fileColor = hardDefaults.fileColor,
  folderTheme = hardDefaults.folderTheme,
  iconSaturation = hardDefaults.iconSaturation,
  iconOpacity = hardDefaults.iconOpacity,
  changeVisibility,
  compact = false,
  domain,
  ...appearanceCallbacks
}: DomainSettingsControlsProps) {
  const appearanceProps: AppearanceControlsProps = {
    iconSize,
    iconPack,
    folderColor,
    fileColor,
    folderTheme,
    iconSaturation,
    iconOpacity,
    compact,
    ...appearanceCallbacks,
  };

  if (!compact) {
    return (
      <>
        <FormControlLabel
          control={
            <Checkbox
              checked={extensionEnabled}
              disabled={visibilityChanging}
              onChange={(event) => changeVisibility(event.target.checked)}
            />
          }
          label='Enable icons'
        />
        <AppearanceControls {...appearanceProps} />
      </>
    );
  }

  return (
    <>
      <Box className='site-toggle'>
        <Box>
          <Typography sx={{ fontWeight: 600 }}>Icons on this site</Typography>
          <Typography variant='body2' color='text.secondary' noWrap>
            {domain} ·{' '}
            {visibilityChanging
              ? 'Saving…'
              : extensionEnabled
                ? 'Active'
                : 'Disabled'}
          </Typography>
        </Box>
        <Switch
          checked={extensionEnabled}
          disabled={visibilityChanging}
          onChange={(event) => changeVisibility(event.target.checked)}
          slotProps={{ input: { 'aria-label': `Icons on ${domain}` } }}
        />
      </Box>
      {visibilityRefreshRequired && (
        <Alert
          className='refresh-required-alert'
          severity='warning'
          action={
            <Button color='inherit' size='small' onClick={refreshPage}>
              Reload
            </Button>
          }
        >
          Changes apply after reload.
        </Alert>
      )}
      <Accordion
        className='appearance-accordion'
        disableGutters
        elevation={0}
        slotProps={compact ? { transition: { timeout: 0 } } : undefined}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='appearance-panel-content'
          id='appearance-panel-header'
        >
          <Box className='appearance-summary'>
            <Typography>Appearance</Typography>
            <Typography variant='body2' color='text.secondary'>
              {snakeToTitleCase(iconPack)} · {iconSizeLabels[iconSize]}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails id='appearance-panel-content'>
          <Box
            component='fieldset'
            className='appearance-settings'
            disabled={!extensionEnabled}
          >
            <AppearanceControls {...appearanceProps} />
          </Box>
        </AccordionDetails>
      </Accordion>
    </>
  );
}
