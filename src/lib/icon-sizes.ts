import { getConfig, onConfigChange } from './user-config';

export type IconSize = 'sm' | 'md' | 'lg' | 'xl';

const setSizeAttribute = (iconSize: IconSize) =>
  document.body.setAttribute(`data-material-icons-extension-size`, iconSize);

export const initIconSizes = () => {
  const setIconSize = () => getConfig('iconSize').then(setSizeAttribute);

  document.addEventListener('DOMContentLoaded', setIconSize, false);

  onConfigChange('iconSize', setSizeAttribute);
  onConfigChange('iconSize', setIconSize, 'default');
};
