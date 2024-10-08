import Browser from 'webextension-polyfill';
import { checkAccess } from './access';
import { isPageSupported } from './helper';

export enum PageState {
  Supported,
  NotSupported,
  AskForAccess,
  HasAccess,
}

export const checkPageState = async (tab: Browser.Tabs.Tab) => {
  const domain = new URL(tab.url ?? '').host;
  const supported = await isPageSupported(domain);
  if (supported) return PageState.Supported;

  // we are in some internal browser page, not supported.
  if (tab.url && !tab.url.startsWith('http')) {
    return PageState.NotSupported;
  }

  const access = await checkAccess(tab);
  if (access === false) {
    return PageState.AskForAccess;
  } else {
    return PageState.HasAccess;
  }
};
