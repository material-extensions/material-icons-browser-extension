import Browser from 'webextension-polyfill';
import { getGitProvider } from '@/providers';

export function getElementByIdOrThrow<T = HTMLElement>(
  id: string
): NonNullable<T> {
  const el = document.getElementById(id) as T | null;
  if (!el) {
    throw new Error(`Element with id ${id} not found`);
  }

  return el;
}

export const isPageSupported = (domain: string) => getGitProvider(domain);

export function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };

  return Browser.tabs.query(queryOptions).then(([tab]) => tab);
}

export function getDomainFromCurrentTab() {
  return getCurrentTab().then((tab) => {
    const url = new URL(tab.url ?? '');
    return url.hostname;
  });
}
