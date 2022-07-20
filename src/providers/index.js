import githubConfig from './github';
import bitbucketConfig from './bitbucket';
import azureConfig from './azure';
import giteaConfig from './gitea';
import gitlabConfig from './gitlab';
import giteeConfig from './gitee';
import sourceforgeConfig from './sourceforge';

export const providerConfig = {
  github: githubConfig,
  bitbucket: bitbucketConfig,
  azure: azureConfig,
  gitea: giteaConfig,
  gitlab: gitlabConfig,
  gitee: giteeConfig,
  sourceforge: sourceforgeConfig,
};

/**
 * Get all selectors and functions specific to the Git provider
 *
 * @param {string} href Url of current tab
 * @returns {object} All of the values needed for the provider
 */
export const getGitProvider = (href) => {
  switch (true) {
    case /github\.com.*/.test(href):
      return providerConfig.github;

    case /bitbucket\.org/.test(href):
      return providerConfig.bitbucket;

    case /gitea\.com/.test(href):
      return providerConfig.gitea;

    case /dev\.azure\.com/.test(href):
    case /visualstudio\.com/.test(href):
      return providerConfig.azure;

    case /gitlab\.com/.test(href):
      return providerConfig.gitlab;

    case /gitee\.com/.test(href):
      return providerConfig.gitee;

    case /sourceforge\.net/.test(href):
      return providerConfig.sourceforge;

    default:
      return null;
  }
};
