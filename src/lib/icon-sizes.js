import { getConfig, onConfigChange } from './userConfig';

const setSizeAttribute = (iconSize) =>
  document.body.setAttribute(`data-material-icons-extension-size`, iconSize);

export const initIconSizes = () => {
  const setIconSize = () => getConfig('iconSize').then(setSizeAttribute);

  document.addEventListener('DOMContentLoaded', setIconSize, false);

  onConfigChange('iconSize', setSizeAttribute);
  onConfigChange('iconSize', setIconSize, 'default');
};
