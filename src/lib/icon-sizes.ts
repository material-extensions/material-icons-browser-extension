import { addConfigChangeListener, getConfig } from './user-config';

export const iconSizes = ['sm', 'md', 'lg', 'xl'];
export type IconSize = (typeof iconSizes)[number];

const ATTRIBUTE_NAME = 'data-material-icons-extension-size';

const setSizeAttribute = (iconSize: IconSize) =>
  document.body.setAttribute(ATTRIBUTE_NAME, iconSize);

const observeBodyChanges = () => {
  const observer = new MutationObserver(() => {
    getConfig('iconSize').then(iconSize => {
      if (!document.body.hasAttribute(ATTRIBUTE_NAME)) {
        setSizeAttribute(iconSize);
      }
    });
  });

  observer.observe(document.body, { attributes: true, subtree: false });
};

export const initIconSizes = () => {
  const setIconSize = () => getConfig('iconSize').then(setSizeAttribute);

  document.addEventListener('DOMContentLoaded', () => {
    setIconSize();
    observeBodyChanges();
  }, false);

  addConfigChangeListener('iconSize', setSizeAttribute);
  addConfigChangeListener('iconSize', setIconSize, 'default');
};
