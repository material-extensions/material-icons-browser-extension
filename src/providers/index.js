import github from './github';
import bitbucket from './bitbucket';
import azure from './azure';
import gitea from './gitea';
import gitlab from './gitlab';
import gitee from './gitee';
import sourceforge from './sourceforge';
import { getCustomProviders } from '../lib/custom-providers';

export const providers = {
  azure,
  bitbucket,
  gitea,
  gitee,
  github,
  gitlab,
  sourceforge,
};

export const providerConfig = {};

for (const provider of Object.values(providers)) {
  const cfg = provider();

  providerConfig[cfg.name] = cfg;
}

function regExpEscape(str) {
  return str.replace(/[-[\]{}()*+!<=:?./\\^$|#\s,]/g, '\\$&');
}

/**
 * Add custom git provider
 *
 * @param {string} name
 * @param {string|CallableFunction} handler
 */
export const addGitProvider = (name, handler) => {
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
 *
 * @param {string} href Url of current tab
 * @param domain
 * @returns {object} All of the values needed for the provider
 */
export const getGitProvider = (domain) => {
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
