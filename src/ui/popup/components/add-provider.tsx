import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import Browser from 'webextension-polyfill';
import { addCustomProvider } from '@/lib/custom-providers';
import { addGitProvider, providerConfig } from '@/providers';
import { getCurrentTab } from '../api/helper';

export function AddProvider(props: {
  suggestedProvider: string;
  domain: string;
}) {
  const { suggestedProvider, domain } = props;
  const [providers, setProviders] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] =
    useState<string>(suggestedProvider);

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
    <Box sx={{ p: 2 }}>
      <Typography variant='body1'>
        Select a provider configuration to add to the domain.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <FormControl fullWidth size='small'>
          <InputLabel>Provider Configuration</InputLabel>
          <Select
            id='select-provider-config'
            label='Provider Configuration'
            onChange={(e) => setSelectedProvider(e.target.value as string)}
            value={selectedProvider}
          >
            {providers.map((provider) => (
              <MenuItem key={provider} value={provider}>
                {provider}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button onClick={addProvider} variant='contained'>
          Add custom provider
        </Button>
      </Box>
    </Box>
  );
}
