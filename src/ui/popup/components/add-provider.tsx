import { addCustomProvider } from '@/lib/custom-providers';
import { addGitProvider, providerConfig } from '@/providers';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import Browser from 'webextension-polyfill';
import { getCurrentTab } from '../api/helper';

export function AddProvider(props: {
  suggestedProvider: string;
  domain: string;
}) {
  const { suggestedProvider, domain } = props;
  const [providers, setProviders] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  useEffect(() => {
    const providers = Object.values(providerConfig)
      .filter((provider) => !provider.isCustom && provider.canSelfHost)
      .map((provider) => provider.name);

    setProviders(providers);
  }, []);

  const addProvider = () => {
    if (!selectedProvider) return;
    addCustomProvider(domain, selectedProvider).then(async () => {
      addGitProvider(domain, selectedProvider);

      const cmd = {
        cmd: 'init',
      };

      const tab = await getCurrentTab();
      Browser.tabs.sendMessage(tab.id ?? 0, cmd);

      // reload the popup to show the settings.
      window.location.reload();
    });
  };

  return (
    <>
      <div>
        <FormControl fullWidth size='small'>
          <InputLabel>Provider Configuration</InputLabel>
          <Select
            id='select-provider-config'
            label='Provider Configuration'
            value={suggestedProvider}
            onChange={(event) => setSelectedProvider(event.target.value)}
          >
            {providers.map((provider) => (
              <MenuItem key={provider} value={provider}>
                {provider}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <button type='button' onClick={addProvider}>
        <span>Add custom provider</span>
      </button>
    </>
  );
}
