import { IconSize } from '@/lib/icon-sizes';
import { getConfig, setConfig } from '@/lib/user-config';
import { IconPackValue } from 'material-icon-theme';
import Browser from 'webextension-polyfill';
import { getElementByIdOrThrow } from './helper';

export function registerControls(domain: string) {
  getConfig<IconSize>('iconSize', domain).then((size) => {
    getElementByIdOrThrow<HTMLInputElement>('icon-size').value = size;
  });
  const updateIconSize = (event: Event) =>
    setConfig('iconSize', (event.target as HTMLInputElement).value, domain);
  document
    ?.getElementById('icon-size')
    ?.addEventListener('change', updateIconSize);

  getConfig<IconPackValue>('iconPack', domain).then((pack) => {
    getElementByIdOrThrow<HTMLInputElement>('icon-pack').value = pack;
  });
  const updateIconPack = (event: Event) =>
    setConfig('iconPack', (event.target as HTMLInputElement).value, domain);
  document
    ?.getElementById('icon-pack')
    ?.addEventListener('change', updateIconPack);

  document
    .getElementById('options-btn')
    ?.addEventListener('click', () => Browser.runtime.openOptionsPage());
}
