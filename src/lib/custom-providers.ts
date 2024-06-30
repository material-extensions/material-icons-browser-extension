import Browser from 'webextension-polyfill';
import { Provider } from '../models';

export const getCustomProviders = (): Promise<
  Record<string, (() => Provider) | string>
> =>
  Browser.storage.sync
    .get('customProviders')
    .then((data) => data.customProviders || {});

export const addCustomProvider = (
  name: string,
  handler: (() => Provider) | string
) =>
  getCustomProviders().then((customProviders) => {
    customProviders[name] = handler;

    return Browser.storage.sync.set({ customProviders });
  });
