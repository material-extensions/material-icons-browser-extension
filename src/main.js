import { getGitProvider } from './providers';
import { observePage } from './lib/replace-icons';
import { initIconSizes } from './lib/icon-sizes';

initIconSizes();
const gitProvider = getGitProvider();

chrome.storage.sync
  .get({
    iconPack: 'react',
  })
  .then(({ iconPack }) => {
    if (gitProvider) observePage(gitProvider, iconPack);
  });
