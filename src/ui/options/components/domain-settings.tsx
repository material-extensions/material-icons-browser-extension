import { IconSize } from '@/lib/icon-sizes';
import {
  clearConfig,
  getConfig,
  hardDefaults,
  setConfig,
} from '@/lib/user-config';
import { IconPackValue } from 'material-icon-theme';
import { CSSProperties, useEffect, useState } from 'react';
import { DomainSettingsControls } from '../../shared/domain-settings-controls';
import { DomainName } from './domain-name';

export function DomainSettings({ domain }: { domain: string }) {
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
    getConfig<IconSize>('iconSize', domain, false).then(setIconSize);
    getConfig<IconPackValue>('iconPack', domain, false).then(setIconPack);
    getConfig<boolean>('extEnabled', domain, false).then(setExtensionEnabled);

    const handleResetAllDomains = (event: Event) => {
      if (event.type === 'RESET_ALL_DOMAINS') {
        resetToDefaults();
      }
    };

    if (domain !== 'default') {
      window.addEventListener('RESET_ALL_DOMAINS', handleResetAllDomains);

      // return cleanup function
      return () => {
        window.removeEventListener('RESET_ALL_DOMAINS', handleResetAllDomains);
      };
    }
  }, []);

  const updateIconSize = (iconSize: IconSize) => {
    setConfig('iconSize', iconSize, domain);
    setIconSize(iconSize);
  };

  const updateIconPack = (iconPack: IconPackValue) => {
    setConfig('iconPack', iconPack, domain);
    setIconPack(iconPack);
  };

  const changeVisibility = (visible: boolean) => {
    setConfig('extEnabled', visible, domain);
    setExtensionEnabled(visible);
  };

  const resetToDefaults = async () => {
    clearConfig('iconSize', domain);
    clearConfig('iconPack', domain);
    clearConfig('extEnabled', domain);

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
      windowWidth <= breakpointWidth ? '1fr 1fr' : '1fr 1fr 2fr 2fr',
    color: 'white',
    alignItems: 'center',
    fontSize: '1rem',
    padding: '1rem 1.5rem',
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
        changeIconSize={updateIconSize}
        changeIconPack={updateIconPack}
      />
    </div>
  );
}
