import { getGitProvider, addGitProvider } from './providers';
import { observePage, replaceAllIcons } from './lib/replace-icons';
import { initIconSizes } from './lib/icon-sizes';
import { getConfig, onConfigChange } from './lib/userConfig';
import { getCustomProviders } from './lib/custom-providers';

async function loadCustomProviders() {
  const customProviders = await getCustomProviders();

  for (const [domain, handler] of Object.entries(customProviders)) {
    addGitProvider(domain, handler);
  }
}

async function init() {
  initIconSizes();

  await loadCustomProviders();

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
}

init();
