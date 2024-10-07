import { getConfig } from '@/lib/user-config';
import Browser from 'webextension-polyfill';
import { getElementByIdOrThrow } from './helper';

export function displayAllDisabledNote() {
  getConfig('extEnabled', 'default').then((enabled) => {
    if (enabled) return;
    getElementByIdOrThrow('default-disabled-note').style.display = 'block';
    getElementByIdOrThrow('domain-settings').style.display = 'none';
    document
      .getElementById('options-link')
      ?.addEventListener('click', () => Browser.runtime.openOptionsPage());
  });
}
