import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getResolvedPageConfig } from './page-config';

const mockGet = vi.fn();

vi.mock('webextension-polyfill', () => ({
  default: {
    storage: {
      sync: {
        get: (...args: unknown[]) => mockGet(...args),
      },
    },
  },
}));

describe('page-config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { hostname: 'git.example.local' },
      writable: true,
    });
  });

  it('loads all page config values with a single storage read', async () => {
    mockGet.mockResolvedValue({
      'git.example.local:iconPack': 'angular',
      'default:iconPack': 'react',
      'default:fileIconBindings': {},
      'default:folderIconBindings': {},
      'git.example.local:extEnabled': true,
      'default:extEnabled': true,
    });

    const config = await getResolvedPageConfig('git.example.local');

    expect(config).toEqual({
      iconPack: 'angular',
      fileBindings: {},
      folderBindings: {},
      enabled: true,
    });
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith({
      'git.example.local:iconPack': null,
      'default:iconPack': 'react',
      'git.example.local:fileIconBindings': null,
      'default:fileIconBindings': {},
      'git.example.local:folderIconBindings': null,
      'default:folderIconBindings': {},
      'git.example.local:extEnabled': null,
      'default:extEnabled': true,
    });
  });

  it('falls back to defaults and resolves disabled state', async () => {
    mockGet.mockResolvedValue({
      'default:iconPack': 'react',
      'default:fileIconBindings': {},
      'default:folderIconBindings': {},
      'git.example.local:extEnabled': false,
      'default:extEnabled': true,
    });

    await expect(getResolvedPageConfig('git.example.local')).resolves.toEqual({
      iconPack: 'react',
      fileBindings: {},
      folderBindings: {},
      enabled: false,
    });
  });
});
