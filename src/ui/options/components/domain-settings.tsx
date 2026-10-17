import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PublicIcon from '@mui/icons-material/Public';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Switch,
  Typography,
} from '@mui/material';
import { IconPackValue } from 'material-icon-theme';
import { useEffect, useState } from 'react';
import { FolderTheme } from '@/lib/folder-theme';
import { IconSize } from '@/lib/icon-sizes';
import {
  clearConfig,
  getConfig,
  hardDefaults,
  setConfig,
  UserConfig,
} from '@/lib/user-config';
import { Domain } from '@/models';
import { AppearanceControls } from '../../shared/appearance-controls';
import { DomainActions } from './domain-actions';

const overrideKeys: (keyof UserConfig)[] = [
  'extEnabled',
  'iconPack',
  'iconSize',
  'folderTheme',
  'folderColor',
  'fileColor',
  'iconSaturation',
  'iconOpacity',
];

export function DomainSettings({
  domain,
  deleteDomain,
}: {
  domain: Domain;
  deleteDomain?: () => void;
}) {
  const [iconSize, setIconSize] = useState<IconSize>(hardDefaults.iconSize);
  const [iconPack, setIconPack] = useState<IconPackValue>(
    hardDefaults.iconPack
  );
  const [extensionEnabled, setExtensionEnabled] = useState(
    hardDefaults.extEnabled
  );
  const [folderColor, setFolderColor] = useState(hardDefaults.folderColor);
  const [fileColor, setFileColor] = useState(hardDefaults.fileColor);
  const [iconSaturation, setIconSaturation] = useState(
    hardDefaults.iconSaturation
  );
  const [iconOpacity, setIconOpacity] = useState(hardDefaults.iconOpacity);
  const [folderTheme, setFolderTheme] = useState<FolderTheme>(
    hardDefaults.folderTheme
  );
  const [overrides, setOverrides] = useState<Set<keyof UserConfig>>(new Set());

  const loadSettings = async () => {
    const [
      nextIconSize,
      nextIconPack,
      nextEnabled,
      nextFolderColor,
      nextFileColor,
      nextFolderTheme,
      nextSaturation,
      nextOpacity,
    ] = await Promise.all([
      getConfig('iconSize', domain.name),
      getConfig('iconPack', domain.name),
      getConfig('extEnabled', domain.name),
      getConfig('folderColor', domain.name),
      getConfig('fileColor', domain.name),
      getConfig('folderTheme', domain.name),
      getConfig('iconSaturation', domain.name),
      getConfig('iconOpacity', domain.name),
    ]);

    setIconSize(nextIconSize);
    setIconPack(nextIconPack);
    setExtensionEnabled(nextEnabled);
    setFolderColor(nextFolderColor);
    setFileColor(nextFileColor);
    setFolderTheme(nextFolderTheme);
    setIconSaturation(nextSaturation);
    setIconOpacity(nextOpacity);

    if (!domain.isDefault) {
      const values = await Promise.all(
        overrideKeys.map((key) => getConfig(key, domain.name, false))
      );
      setOverrides(
        new Set(overrideKeys.filter((_, index) => values[index] !== null))
      );
    }
  };

  useEffect(() => {
    loadSettings();

    if (domain.isDefault) return;
    const handleResetAllDomains = () => resetToDefaults();
    window.addEventListener('RESET_ALL_DOMAINS', handleResetAllDomains);
    return () =>
      window.removeEventListener('RESET_ALL_DOMAINS', handleResetAllDomains);
  }, []);

  const markOverride = (key: keyof UserConfig) => {
    if (domain.isDefault) return;
    setOverrides((current) => new Set(current).add(key));
  };

  const update = <T extends keyof UserConfig>(key: T, value: UserConfig[T]) => {
    setConfig(key, value, domain.name);
    markOverride(key);
  };

  const changeIconSize = (value: IconSize) => {
    update('iconSize', value);
    setIconSize(value);
  };
  const changeIconPack = (value: IconPackValue) => {
    update('iconPack', value);
    setIconPack(value);
  };
  const changeVisibility = (value: boolean) => {
    update('extEnabled', value);
    setExtensionEnabled(value);
  };
  const changeFolderColor = (value: string) => {
    update('folderColor', value);
    setFolderColor(value);
  };
  const changeFileColor = (value: string) => {
    update('fileColor', value);
    setFileColor(value);
  };
  const changeFolderTheme = (value: FolderTheme) => {
    update('folderTheme', value);
    setFolderTheme(value);
  };
  const changeIconSaturation = (value: number) => {
    update('iconSaturation', value);
    setIconSaturation(value);
  };
  const changeIconOpacity = (value: number) => {
    update('iconOpacity', value);
    setIconOpacity(value);
  };

  const clearSetting = async (key: 'folderColor' | 'fileColor') => {
    await clearConfig(key, domain.name);
    const value = await getConfig(key, domain.name);
    if (key === 'folderColor') setFolderColor(value);
    else setFileColor(value);
    setOverrides((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
  };

  async function resetToDefaults() {
    await Promise.all(
      [
        ...overrideKeys,
        'fileIconBindings' as const,
        'folderIconBindings' as const,
      ].map((key) => clearConfig(key, domain.name))
    );
    setOverrides(new Set());
    await loadSettings();
  }

  const inheritsDefaults = !domain.isDefault && overrides.size === 0;
  const panelId = `domain-${domain.name.replace(/[^a-z0-9]+/gi, '-')}`;

  return (
    <Accordion
      className='domain-card'
      defaultExpanded={domain.isDefault}
      disableGutters
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${panelId}-content`}
        id={`${panelId}-header`}
      >
        <Box className='domain-card-summary'>
          <Box className='domain-card-name'>
            <PublicIcon fontSize='small' />
            <Typography component='h3'>{domain.name}</Typography>
          </Box>
          <Box className='domain-card-badges'>
            {domain.isDefault && <Chip label='Default' size='small' />}
            {inheritsDefaults && (
              <Chip label='Inherits defaults' size='small' variant='outlined' />
            )}
            {!domain.isDefault && overrides.size > 0 && (
              <Chip label='Customized' size='small' variant='outlined' />
            )}
            <Chip
              label={extensionEnabled ? 'Enabled' : 'Disabled'}
              size='small'
              color={extensionEnabled ? 'success' : 'default'}
              variant='outlined'
            />
            <Switch
              size='small'
              checked={extensionEnabled}
              slotProps={{
                input: { 'aria-label': `Enable icons on ${domain.name}` },
              }}
              onClick={(event) => event.stopPropagation()}
              onFocus={(event) => event.stopPropagation()}
              onChange={(event) => changeVisibility(event.target.checked)}
            />
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails id={`${panelId}-content`}>
        <Box
          component='fieldset'
          className='domain-appearance-grid'
          disabled={!extensionEnabled}
        >
          <AppearanceControls
            iconSize={iconSize}
            iconPack={iconPack}
            folderColor={folderColor}
            fileColor={fileColor}
            folderTheme={folderTheme}
            iconSaturation={iconSaturation}
            iconOpacity={iconOpacity}
            compact
            resetFolderColor={() => clearSetting('folderColor')}
            resetFileColor={() => clearSetting('fileColor')}
            changeIconSize={changeIconSize}
            changeIconPack={changeIconPack}
            changeFolderColor={changeFolderColor}
            changeFileColor={changeFileColor}
            changeFolderTheme={changeFolderTheme}
            changeIconSaturation={changeIconSaturation}
            changeIconOpacity={changeIconOpacity}
          />
        </Box>

        <Box className='domain-card-actions'>
          {!domain.isDefault && (
            <Button onClick={resetToDefaults} disabled={inheritsDefaults}>
              Reset to defaults
            </Button>
          )}
          <DomainActions domain={domain} deleteDomain={deleteDomain} />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
