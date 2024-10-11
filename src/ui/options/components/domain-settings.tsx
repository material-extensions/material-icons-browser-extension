import { IconSize } from '@/lib/icon-sizes';
import {
  clearConfig,
  getConfig,
  hardDefaults,
  setConfig,
} from '@/lib/user-config';
import { Domain } from '@/models';
import { IconPackValue } from 'material-icon-theme';
import { CSSProperties, useEffect, useState } from 'react';
import { DomainSettingsControls } from '../../shared/domain-settings-controls';
import { DomainActions } from './domain-actions';
import { DomainName } from './domain-name';

export function DomainSettings({
  domain,
  deleteDomain,
}: { domain: Domain; deleteDomain: () => void }) {
  const [iconSize, setIconSize] = useState<IconSize | undefined>(
    hardDefaults.iconSize
  );
  const [iconPack, setIconPack] = useState<IconPackValue | undefined>(
    hardDefaults.iconPack
  );
  const [extensionEnabled, setExtensionEnabled] = useState<boolean>(
    hardDefaults.extEnabled
  );

  useEffect(() => {
    getConfig('iconSize', domain.name, false).then(setIconSize);
    getConfig('iconPack', domain.name, false).then(setIconPack);
    getConfig('extEnabled', domain.name, false).then(setExtensionEnabled);

    const handleResetAllDomains = (event: Event) => {
      if (event.type === 'RESET_ALL_DOMAINS') {
        resetToDefaults();
      }
    };

    if (domain.name !== 'default') {
      window.addEventListener('RESET_ALL_DOMAINS', handleResetAllDomains);

      // return cleanup function
      return () => {
        window.removeEventListener('RESET_ALL_DOMAINS', handleResetAllDomains);
      };
    }
  }, []);

  const changeIconSize = (iconSize: IconSize) => {
    setConfig('iconSize', iconSize, domain.name);
    setIconSize(iconSize);
  };

  const changeIconPack = (iconPack: IconPackValue) => {
    setConfig('iconPack', iconPack, domain.name);
    setIconPack(iconPack);
  };

  const changeVisibility = (visible: boolean) => {
    setConfig('extEnabled', visible, domain.name);
    setExtensionEnabled(visible);
  };

  const resetToDefaults = async () => {
    clearConfig('iconSize', domain.name);
    clearConfig('iconPack', domain.name);
    clearConfig('extEnabled', domain.name);

    setIconSize(undefined);
    setIconPack(undefined);
    setExtensionEnabled(hardDefaults.extEnabled);
  };

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const breakpointWidth = 1024;

  const styles: CSSProperties = {
    display: 'grid',
    gridTemplateColumns:
      windowWidth <= breakpointWidth ? '1fr 1fr' : '2fr 1fr 1fr 1fr .5fr',
    color: 'text.primary',
    alignItems: 'center',
    fontSize: '1rem',
    padding: '0.5rem 1.5rem',
    gap: windowWidth <= breakpointWidth ? '0.5rem' : '1.5rem',
  };

  return (
    <div style={styles}>
      <DomainName domain={domain} />
      <DomainSettingsControls
        iconSize={iconSize}
        iconPack={iconPack}
        extensionEnabled={extensionEnabled}
        changeVisibility={changeVisibility}
        changeIconSize={changeIconSize}
        changeIconPack={changeIconPack}
      />
      <DomainActions domain={domain} deleteDomain={deleteDomain} />
    </div>
  );
}
