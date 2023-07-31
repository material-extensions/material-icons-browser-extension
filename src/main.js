import { getGitProvider } from './providers';
import { observePage, replaceAllIcons } from './lib/replace-icons';
import { initIconSizes } from './lib/icon-sizes';
import { getConfig, onConfigChange } from './lib/userConfig';

initIconSizes();
const { href } = window.location;
const gitProvider = getGitProvider(href);

Promise.all([
  getConfig('iconPack'),
  getConfig('extEnabled'),
  getConfig('extEnabled', 'default'),
]).then(([iconPack, extEnabled, globalExtEnabled]) => {
  if (!globalExtEnabled || !extEnabled || !gitProvider) return;
  observePage(gitProvider, iconPack);
  onConfigChange('iconPack', (newIconPack) => replaceAllIcons(gitProvider, newIconPack));
});
