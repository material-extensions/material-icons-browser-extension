import github from './github';
import bitbucket from './bitbucket';
import azure from './azure';
import gitea from './gitea';
import gitlab from './gitlab';
import gitee from './gitee';
import sourceforge from './sourceforge';

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

/**
 * Get all selectors and functions specific to the Git provider
 *
 * @param {string} href Url of current tab
 * @returns {object} All of the values needed for the provider
 */
export const getGitProvider = (href) => {
  if (!href.startsWith('http')) {
    href = new URL(`http://${href}`);
  }

  for (const provider of Object.values(providerConfig)) {
    for (const domain of provider.domains) {
      if (domain.test(href.host)) {
        return provider;
      }
    }
  }

  return null;
};

/**
 * Add custom git provider
 *
 * @param {string} name
 * @param {string|CallableFunction} handler
 */
export const addGitProvider = (name, handler) => {
  handler = typeof handler === 'string' ? providers[handler] : handler;

  providerConfig[name] = handler();
};
