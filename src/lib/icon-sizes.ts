import { addConfigChangeListener, getConfig } from './user-config';

export type IconSize = 'sm' | 'md' | 'lg' | 'xl';

const setSizeAttribute = (iconSize: IconSize) =>
  document.body.setAttribute(`data-material-icons-extension-size`, iconSize);

export const initIconSizes = () => {
  const setIconSize = () =>
    getConfig<IconSize>('iconSize').then(setSizeAttribute);

  document.addEventListener('DOMContentLoaded', setIconSize, false);

  addConfigChangeListener('iconSize', setSizeAttribute);
  addConfigChangeListener('iconSize', setIconSize, 'default');
};
