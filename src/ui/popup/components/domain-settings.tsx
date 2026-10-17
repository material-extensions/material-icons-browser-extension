import { IconPackValue } from 'material-icon-theme';
import { useEffect, useState } from 'react';
import Browser from 'webextension-polyfill';
import { FolderTheme } from '@/lib/folder-theme';
import { IconSize } from '@/lib/icon-sizes';
import {
  clearConfig,
  getConfig,
  hardDefaults,
  setConfig,
} from '@/lib/user-config';
import { DomainSettingsControls } from '@/ui/shared/domain-settings-controls';

export function DomainSettings({ domain }: { domain: string }) {
  const [extensionEnabled, setExtensionEnabled] = useState<boolean>(
    hardDefaults.extEnabled
  );
  const [iconSize, setIconSize] = useState<IconSize>(hardDefaults.iconSize);
  const [iconPack, setIconPack] = useState<IconPackValue>(
    hardDefaults.iconPack
  );
  const [folderColor, setFolderColor] = useState(hardDefaults.folderColor);
  const [fileColor, setFileColor] = useState(hardDefaults.fileColor);
  const [folderTheme, setFolderTheme] = useState<FolderTheme>(
    hardDefaults.folderTheme
  );
  const [iconSaturation, setIconSaturation] = useState(
    hardDefaults.iconSaturation
  );
  const [iconOpacity, setIconOpacity] = useState(hardDefaults.iconOpacity);
  const [visibilityChanging, setVisibilityChanging] = useState(false);
  const [visibilityRefreshRequired, setVisibilityRefreshRequired] =
    useState(false);

  const changeVisibility = async (visible: boolean) => {
    const previousValue = extensionEnabled;
    setExtensionEnabled(visible);
    setVisibilityChanging(true);
    setVisibilityRefreshRequired(false);

    try {
      await setConfig('extEnabled', visible, domain);
      setVisibilityRefreshRequired(true);
    } catch {
      setExtensionEnabled(previousValue);
    } finally {
      setVisibilityChanging(false);
    }
  };

  const refreshPage = async () => {
    const [tab] = await Browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.id !== undefined) await Browser.tabs.reload(tab.id);
  };

  const updateIconSize = (iconSize: IconSize) => {
    setConfig('iconSize', iconSize, domain);
    setIconSize(iconSize);
  };

  const updateIconPack = (iconPack: IconPackValue) => {
    setConfig('iconPack', iconPack, domain);
    setIconPack(iconPack);
  };

  const updateFolderColor = (color: string) => {
    setConfig('folderColor', color, domain);
    setFolderColor(color);
  };

  const updateFileColor = (color: string) => {
    setConfig('fileColor', color, domain);
    setFileColor(color);
  };

  const updateFolderTheme = (value: FolderTheme) => {
    setConfig('folderTheme', value, domain);
    setFolderTheme(value);
  };

  const updateIconSaturation = (value: number) => {
    setConfig('iconSaturation', value, domain);
    setIconSaturation(value);
  };

  const updateIconOpacity = (value: number) => {
    setConfig('iconOpacity', value, domain);
    setIconOpacity(value);
  };

  const resetFolderColor = async () => {
    await clearConfig('folderColor', domain);
    setFolderColor(await getConfig('folderColor', domain));
  };

  const resetFileColor = async () => {
    await clearConfig('fileColor', domain);
    setFileColor(await getConfig('fileColor', domain));
  };

  useEffect(() => {
    getConfig('extEnabled', domain).then((enabled) =>
      setExtensionEnabled(enabled)
    );
    getConfig('iconSize', domain).then((size) => setIconSize(size));
    getConfig('iconPack', domain).then((pack) => setIconPack(pack));
    getConfig('folderColor', domain).then(setFolderColor);
    getConfig('fileColor', domain).then(setFileColor);
    getConfig('folderTheme', domain).then(setFolderTheme);
    getConfig('iconSaturation', domain).then(setIconSaturation);
    getConfig('iconOpacity', domain).then(setIconOpacity);
  }, []);

  return (
    <div className='domain-settings'>
      <DomainSettingsControls
        iconSize={iconSize}
        iconPack={iconPack}
        folderColor={folderColor}
        fileColor={fileColor}
        folderTheme={folderTheme}
        iconSaturation={iconSaturation}
        iconOpacity={iconOpacity}
        extensionEnabled={extensionEnabled}
        visibilityChanging={visibilityChanging}
        visibilityRefreshRequired={visibilityRefreshRequired}
        refreshPage={refreshPage}
        compact
        domain={domain}
        resetFolderColor={resetFolderColor}
        resetFileColor={resetFileColor}
        changeVisibility={changeVisibility}
        changeIconSize={updateIconSize}
        changeIconPack={updateIconPack}
        changeFolderColor={updateFolderColor}
        changeFileColor={updateFileColor}
        changeFolderTheme={updateFolderTheme}
        changeIconSaturation={updateIconSaturation}
        changeIconOpacity={updateIconOpacity}
      />
    </div>
  );
}
