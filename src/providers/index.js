import githubConfig from './github';
import bitbucketConfig from './bitbucket';
import azureConfig from './azure';
import giteaConfig from './gitea';

const providerConfig = {
  github: githubConfig,
  bitbucket: bitbucketConfig,
  azure: azureConfig,
  gitea: giteaConfig,
};

export default providerConfig;
