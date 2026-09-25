import { beforeEach, describe, expect, it, vi } from 'vitest';
import Browser from 'webextension-polyfill';
import {
  addGitProvider,
  getGitProvider,
  providerConfig,
  restoreRegisteredCustomProviderScripts,
} from './index';

vi.mock('webextension-polyfill', () => ({
  default: {
    storage: {
      sync: {
        get: vi.fn(),
      },
    },
    scripting: {
      getRegisteredContentScripts: vi.fn().mockResolvedValue([]),
      registerContentScripts: vi.fn().mockResolvedValue(undefined),
      updateContentScripts: vi.fn().mockResolvedValue(undefined),
      executeScript: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

const mockGet = Browser.storage.sync.get as ReturnType<typeof vi.fn>;
const mockRegisterContentScripts = Browser.scripting
  .registerContentScripts as ReturnType<typeof vi.fn>;

describe('providers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ customProviders: {} });
    delete providerConfig['192.168.1.10'];
    delete providerConfig['git.example.local'];
  });

  it('matches custom providers for URLs with ports', async () => {
    addGitProvider('192.168.1.10', 'forgejo');

    const provider = await getGitProvider('http://192.168.1.10:3000/user/repo');

    expect(provider?.name).toBe('192.168.1.10');
  });

  it('restores dynamic content scripts for stored custom providers', async () => {
    mockGet.mockResolvedValue({
      customProviders: { 'git.example.local': 'github' },
    });

    await restoreRegisteredCustomProviderScripts();

    expect(mockRegisterContentScripts).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'material-icons',
        matches: ['*://git.example.local/*'],
      }),
    ]);
  });
});
