import { getGitProvider } from './providers';
import { observePage, replaceAllIcons } from './lib/replace-icons';
import { initIconSizes } from './lib/icon-sizes';
import { getConfig, onConfigChange } from './lib/userConfig';

initIconSizes();
const { href } = window.location;
const gitProvider = getGitProvider(href);

getConfig('iconPack').then((iconPack) => {
  if (gitProvider) observePage(gitProvider, iconPack);
});

onConfigChange('iconPack', (newIconPack) => replaceAllIcons(gitProvider, newIconPack));
