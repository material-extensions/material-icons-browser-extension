import Browser from 'webextension-polyfill';
import {
  ensureContentScriptInjectedInTab,
  registerContentScriptForHost,
} from '../lib/content-script-registration';
import { getCustomProviders } from '../lib/custom-providers';
import { getProviderMatchDomains } from '../lib/url-patterns';
import { Provider } from '../models';
import azure from './azure';
import bitbucket from './bitbucket';
import forgejo from './forgejo';
import gitea from './gitea';
import gitee from './gitee';
import github from './github';
import gitlab from './gitlab';
import sourceforge from './sourceforge';
import tangled from './tangled';

export const providers: Record<string, () => Provider> = {
  azure,
  bitbucket,
  gitea,
  gitee,
  github,
  gitlab,
  sourceforge,
  forgejo,
  tangled,
};

export const providerConfig: Record<string, Provider> = {};

for (const provider of Object.values(providers)) {
  const cfg = provider();

  providerConfig[cfg.name] = cfg;
}

function regExpEscape(value: string) {
  return value.replace(/[-[\]{}()*+!<=:?./\\^$|#\s,]/g, '\\$&');
}

/**
 * Add custom git provider
 */
export const addGitProvider = (
  name: string,
  handler: (() => Provider) | string
) => {
  handler = typeof handler === 'string' ? providers[handler] : handler;

  const provider = handler();
  provider.isCustom = true;
  provider.name = name;
  provider.domains = [
    {
      host: name,
      test: new RegExp(`^${regExpEscape(name)}$`),
    },
  ];

  providerConfig[name] = provider;
};

export const removeGitProvider = (name: string) => {
  delete providerConfig[name];
};

export const getSelfHostableProviders = () =>
  Object.values(providerConfig).filter(
    (provider) => !provider.isCustom && provider.canSelfHost
  );

export const getSelfHostableProviderNames = () =>
  getSelfHostableProviders().map((provider) => provider.name);

export const getGitProviders = () =>
  getCustomProviders().then((customProviders) => {
    for (const [domain, handler] of Object.entries(customProviders)) {
      if (!providerConfig[domain]) {
        addGitProvider(domain, handler);
      }
    }

    return providerConfig;
  });

export const restoreRegisteredCustomProviderScripts = async () => {
  const customProviders = await getCustomProviders();
  if (!Browser.scripting?.registerContentScripts) return;

  for (const domain of Object.keys(customProviders)) {
    await registerContentScriptForHost(domain).catch(() => undefined);
  }

  const tabs = await Browser.tabs.query({});
  for (const tab of tabs) {
    if (!tab.url?.startsWith('http')) continue;

    const provider = await getGitProvider(tab.url);
    if (provider?.isCustom && tab.id) {
      await ensureContentScriptInjectedInTab(tab.id).catch(() => undefined);
    }
  }
};

/**
 * Get all selectors and functions specific to the Git provider
 */
export const getGitProvider = (domain: string) => {
  const domains = getProviderMatchDomains(domain);

  return getGitProviders().then((p) => {
    for (const domain of domains) {
      for (const provider of Object.values(p)) {
        for (const d of provider.domains) {
          if (d.test.test(domain)) {
            return provider;
          }
        }
      }
    }

    return null;
  });
};
