import { getGitProvider } from '@/providers';
import Browser from 'webextension-polyfill';

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
