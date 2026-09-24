import { beforeEach, describe, expect, it, vi } from 'vitest';
import Browser from 'webextension-polyfill';
import { addGitProvider, getGitProvider, providerConfig } from './index';

vi.mock('webextension-polyfill', () => ({
  default: {
    storage: {
      sync: {
        get: vi.fn(),
      },
    },
  },
}));

const mockGet = Browser.storage.sync.get as ReturnType<typeof vi.fn>;

describe('providers', () => {
  beforeEach(() => {
    mockGet.mockResolvedValue({ customProviders: {} });
    delete providerConfig['192.168.1.10'];
  });

  it('matches custom providers for URLs with ports', async () => {
    addGitProvider('192.168.1.10', 'forgejo');

    const provider = await getGitProvider('http://192.168.1.10:3000/user/repo');

    expect(provider?.name).toBe('192.168.1.10');
  });
});
