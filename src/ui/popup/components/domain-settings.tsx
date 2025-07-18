import { IconPackValue } from 'material-icon-theme';
import { useEffect, useState } from 'react';
import { IconSize } from '@/lib/icon-sizes';
import { getConfig, hardDefaults, setConfig } from '@/lib/user-config';
import { DomainSettingsControls } from '@/ui/shared/domain-settings-controls';

export function DomainSettings({ domain }: { domain: string }) {
  const [extensionEnabled, setExtensionEnabled] = useState<boolean>(
    hardDefaults.extEnabled
  );
  const [iconSize, setIconSize] = useState<IconSize>(hardDefaults.iconSize);
  const [iconPack, setIconPack] = useState<IconPackValue>(
    hardDefaults.iconPack
  );

  const changeVisibility = (visible: boolean) => {
    setConfig('extEnabled', visible, domain);
    setExtensionEnabled(visible);
  };

  const updateIconSize = (iconSize: IconSize) => {
    setConfig('iconSize', iconSize, domain);
    setIconSize(iconSize);
  };

  const updateIconPack = (iconPack: IconPackValue) => {
    setConfig('iconPack', iconPack, domain);
    setIconPack(iconPack);
  };

  useEffect(() => {
    getConfig('extEnabled', domain).then((enabled) =>
      setExtensionEnabled(enabled)
    );
    getConfig('iconSize', domain).then((size) => setIconSize(size));
    getConfig('iconPack', domain).then((pack) => setIconPack(pack));
  }, []);

  return (
    <div className='domain-settings'>
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
