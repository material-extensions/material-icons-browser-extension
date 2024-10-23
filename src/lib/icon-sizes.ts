import { addConfigChangeListener, getConfig } from './user-config';

export const iconSizes = ['sm', 'md', 'lg', 'xl'];
export type IconSize = (typeof iconSizes)[number];

const setSizeAttribute = (iconSize: IconSize) =>
  document.body.setAttribute(`data-material-icons-extension-size`, iconSize);

export const initIconSizes = () => {
  const setIconSize = () => getConfig('iconSize').then(setSizeAttribute);

  document.addEventListener('DOMContentLoaded', setIconSize, false);

  addConfigChangeListener('iconSize', setSizeAttribute);
  addConfigChangeListener('iconSize', setIconSize, 'default');
};
