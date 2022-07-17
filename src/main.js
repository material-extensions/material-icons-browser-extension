import iconMap from './icon-map.json';

import { getGitProvider } from './providers';
import { observePage } from './lib/replace-icons';
import { initIconSizes } from './lib/icon-sizes';

// Expected configuration.
iconMap.options = {
  ...iconMap.options,
  activeIconPack: 'react_redux',
  // activeIconPack: 'nest', // TODO: implement interface to choose pack
};

initIconSizes();

const gitProvider = getGitProvider();
if (gitProvider) observePage(gitProvider);
