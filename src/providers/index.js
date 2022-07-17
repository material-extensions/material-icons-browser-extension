import githubConfig from './github';
import bitbucketConfig from './bitbucket';
import azureConfig from './azure';
import giteaConfig from './gitea';
import gitlabConfig from './gitlab';
import giteeConfig from './gitee';
import sourceforgeConfig from './sourceforge';

const providerConfig = {
  github: githubConfig,
  bitbucket: bitbucketConfig,
  azure: azureConfig,
  gitea: giteaConfig,
  gitlab: gitlabConfig,
  gitee: giteeConfig,
  sourceforge: sourceforgeConfig,
};

export default providerConfig;
