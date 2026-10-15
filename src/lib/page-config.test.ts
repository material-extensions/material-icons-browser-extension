import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getResolvedPageConfig } from './page-config';

const mockGet = vi.fn();
const mockManagedGet = vi.fn();

vi.mock('webextension-polyfill', () => ({
  default: {
    storage: {
      sync: {
        get: (...args: unknown[]) => mockGet(...args),
      },
      managed: {
        get: (...args: unknown[]) => mockManagedGet(...args),
      },
    },
  },
}));

describe('page-config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockManagedGet.mockRejectedValue(new Error('Managed storage not set'));
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

  it('merges policy bindings under user bindings', async () => {
    mockGet.mockResolvedValue({
      'default:iconPack': 'react',
      'default:fileIconBindings': { '*.foo': 'javascript' },
      'git.example.local:folderIconBindings': { lib: 'folder-lib' },
      'default:folderIconBindings': {},
      'default:extEnabled': true,
    });
    mockManagedGet.mockResolvedValue({
      fileIconBindings: { '*.foo': 'typescript', '*.bar': 'yaml' },
      folderIconBindings: { docs: 'folder-docs' },
    });

    const config = await getResolvedPageConfig('git.example.local');

    expect(config.fileBindings).toEqual({
      '*.foo': 'javascript',
      '*.bar': 'yaml',
    });
    expect(config.folderBindings).toEqual({
      docs: 'folder-docs',
      lib: 'folder-lib',
    });
    expect(mockManagedGet).toHaveBeenCalledWith([
      'fileIconBindings',
      'folderIconBindings',
    ]);
  });
});
