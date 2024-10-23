import { getCustomProviders } from '../lib/custom-providers';
import { Provider } from '../models';
import azure from './azure';
import bitbucket from './bitbucket';
import gitea from './gitea';
import gitee from './gitee';
import github from './github';
import gitlab from './gitlab';
import sourceforge from './sourceforge';

export const providers: Record<string, () => Provider> = {
  azure,
  bitbucket,
  gitea,
  gitee,
  github,
  gitlab,
  sourceforge,
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

export const getGitProviders = () =>
  getCustomProviders().then((customProviders) => {
    for (const [domain, handler] of Object.entries(customProviders)) {
      if (!providerConfig[domain]) {
        addGitProvider(domain, handler);
      }
    }

    return providerConfig;
  });

/**
 * Get all selectors and functions specific to the Git provider
 */
export const getGitProvider = (domain: string) => {
  if (!domain.startsWith('http')) {
    domain = new URL(`http://${domain}`).host;
  } else {
    domain = new URL(domain).host;
  }

  return getGitProviders().then((p) => {
    for (const provider of Object.values(p)) {
      for (const d of provider.domains) {
        if (d.test.test(domain)) {
          return provider;
        }
      }
    }

    return null;
  });
};
