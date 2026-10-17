import Browser from 'webextension-polyfill';
import { addConfigChangeListener, getConfig } from './user-config';

export const normalizePercentage = (value: unknown): number => {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return 100;
  return Math.min(100, Math.max(0, number));
};

const SATURATION_PROPERTY = '--material-icons-extension-saturation';
const OPACITY_PROPERTY = '--material-icons-extension-opacity';

const applyAppearance = (saturation: unknown, opacity: unknown) => {
  const root = document.documentElement;
  root.style.setProperty(
    SATURATION_PROPERTY,
    String(normalizePercentage(saturation) / 100)
  );
  root.style.setProperty(
    OPACITY_PROPERTY,
    String(normalizePercentage(opacity) / 100)
  );
};

const resolveAndApplyAppearance = async () => {
  const [saturation, opacity] = await Promise.all([
    getConfig('iconSaturation'),
    getConfig('iconOpacity'),
  ]);
  applyAppearance(saturation, opacity);
};

export const initIconAppearance = () => {
  resolveAndApplyAppearance();

  addConfigChangeListener('iconSaturation', resolveAndApplyAppearance);
  addConfigChangeListener('iconOpacity', resolveAndApplyAppearance);
  addConfigChangeListener(
    'iconSaturation',
    resolveAndApplyAppearance,
    'default'
  );
  addConfigChangeListener('iconOpacity', resolveAndApplyAppearance, 'default');

  Browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'sync') return;
    const domain = window.location.hostname;
    const overrideRemoved = ['iconSaturation', 'iconOpacity'].some(
      (name) =>
        Object.hasOwn(changes, `${domain}:${name}`) &&
        changes[`${domain}:${name}`]?.newValue === undefined
    );
    if (overrideRemoved) resolveAndApplyAppearance();
  });
};
