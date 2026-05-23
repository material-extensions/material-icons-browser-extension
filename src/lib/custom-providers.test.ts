import { describe, it, expect, vi, beforeEach } from 'vitest';
import Browser from 'webextension-polyfill';
import {
  getCustomProviders,
  addCustomProvider,
  removeCustomProvider,
} from './custom-providers';

vi.mock('webextension-polyfill', () => ({
  default: {
    storage: {
      sync: {
        get: vi.fn(),
        set: vi.fn(),
      },
    },
  },
}));

const mockGet = Browser.storage.sync.get as ReturnType<typeof vi.fn>;
const mockSet = Browser.storage.sync.set as ReturnType<typeof vi.fn>;

describe('custom-providers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSet.mockResolvedValue(undefined);
  });

  describe('getCustomProviders', () => {
    it('returns stored custom providers', async () => {
      const stored = { myProvider: 'https://example.com' };
      mockGet.mockResolvedValue({ customProviders: stored });

      const result = await getCustomProviders();

      expect(mockGet).toHaveBeenCalledWith('customProviders');
      expect(result).toEqual(stored);
    });

    it('returns empty object when nothing stored', async () => {
      mockGet.mockResolvedValue({});

      const result = await getCustomProviders();

      expect(mockGet).toHaveBeenCalledWith('customProviders');
      expect(result).toEqual({});
    });
  });

  describe('addCustomProvider', () => {
    it('adds a new provider and calls set', async () => {
      mockGet.mockResolvedValue({ customProviders: {} });

      await addCustomProvider('newProvider', 'https://example.com');

      expect(mockSet).toHaveBeenCalledWith({
        customProviders: { newProvider: 'https://example.com' },
      });
    });

    it('preserves existing providers when adding new one', async () => {
      const existing = { existingProvider: 'https://existing.com' };
      mockGet.mockResolvedValue({ customProviders: existing });

      await addCustomProvider('newProvider', 'https://new.com');

      expect(mockSet).toHaveBeenCalledWith({
        customProviders: {
          existingProvider: 'https://existing.com',
          newProvider: 'https://new.com',
        },
      });
    });
  });

  describe('removeCustomProvider', () => {
    it('removes the specified provider and calls set', async () => {
      const existing = { providerToRemove: 'https://remove.com' };
      mockGet.mockResolvedValue({ customProviders: existing });

      await removeCustomProvider('providerToRemove');

      expect(mockSet).toHaveBeenCalledWith({
        customProviders: {},
      });
    });

    it('preserves other providers', async () => {
      const existing = {
        keepThis: 'https://keep.com',
        removeThis: 'https://remove.com',
      };
      mockGet.mockResolvedValue({ customProviders: existing });

      await removeCustomProvider('removeThis');

      expect(mockSet).toHaveBeenCalledWith({
        customProviders: { keepThis: 'https://keep.com' },
      });
    });
  });
});
