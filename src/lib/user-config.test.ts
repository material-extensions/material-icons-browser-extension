import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getConfig,
  setConfig,
  clearConfig,
  addConfigChangeListener,
  hardDefaults,
} from './user-config';

const mockGet = vi.fn();
const mockSet = vi.fn();
const mockRemove = vi.fn();
const mockAddListener = vi.fn();

vi.mock('webextension-polyfill', () => ({
  default: {
    storage: {
      sync: {
        get: (...args: unknown[]) => mockGet(...args),
        set: (...args: unknown[]) => mockSet(...args),
        remove: (...args: unknown[]) => mockRemove(...args),
      },
      onChanged: {
        addListener: (...args: unknown[]) => mockAddListener(...args),
      },
    },
  },
}));

describe('user-config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set a default hostname for tests
    Object.defineProperty(window, 'location', {
      value: { hostname: 'github.com' },
      writable: true,
    });
  });

  describe('hardDefaults', () => {
    it('has expected values', () => {
      expect(hardDefaults).toEqual({
        iconPack: 'react',
        iconSize: 'md',
        extEnabled: true,
        fileIconBindings: {},
        folderIconBindings: {},
      });
    });
  });

  describe('getConfig', () => {
    it('returns domain-specific value when it exists', async () => {
      mockGet.mockResolvedValue({
        'github.com:iconPack': 'angular',
        'default:iconPack': 'react',
      });

      const result = await getConfig('iconPack', 'github.com');

      expect(result).toBe('angular');
      expect(mockGet).toHaveBeenCalledWith({
        'github.com:iconPack': null,
        'default:iconPack': 'react',
      });
    });

    it('falls back to default value when no domain-specific value exists', async () => {
      mockGet.mockResolvedValue({
        'default:iconPack': 'angular',
      });

      const result = await getConfig('iconPack', 'github.com');

      expect(result).toBe('angular');
    });

    it('returns hardDefault when no stored value exists', async () => {
      mockGet.mockResolvedValue({
        'default:iconPack': 'react',
      });

      const result = await getConfig('iconPack', 'github.com');

      // The hardDefault for iconPack is 'react', which is passed as the
      // default in the keys object, so Browser.storage.sync.get returns it
      expect(result).toBe('react');
      expect(mockGet).toHaveBeenCalledWith({
        'github.com:iconPack': null,
        'default:iconPack': 'react',
      });
    });

    it('with useDefault=false returns null when no domain-specific value', async () => {
      mockGet.mockResolvedValue({
        'default:iconSize': 'md',
      });

      const result = await getConfig('iconSize', 'github.com', false);

      expect(result).toBeNull();
    });

    it("with domain='default' uses 'SKIP' to avoid matching itself", async () => {
      mockGet.mockResolvedValue({
        'default:extEnabled': true,
      });

      await getConfig('extEnabled', 'default');

      expect(mockGet).toHaveBeenCalledWith({
        'SKIP:extEnabled': null,
        'default:extEnabled': true,
      });
    });
  });

  describe('setConfig', () => {
    it('calls Browser.storage.sync.set with the correct key format', () => {
      setConfig('iconPack', 'angular', 'github.com');

      expect(mockSet).toHaveBeenCalledWith({
        'github.com:iconPack': 'angular',
      });
    });

    it('uses window.location.hostname as default domain', () => {
      setConfig('iconSize', 'lg');

      expect(mockSet).toHaveBeenCalledWith({
        'github.com:iconSize': 'lg',
      });
    });
  });

  describe('clearConfig', () => {
    it('calls Browser.storage.sync.remove with the correct key', () => {
      clearConfig('iconPack', 'github.com');

      expect(mockRemove).toHaveBeenCalledWith('github.com:iconPack');
    });

    it('uses window.location.hostname as default domain', () => {
      clearConfig('extEnabled');

      expect(mockRemove).toHaveBeenCalledWith('github.com:extEnabled');
    });
  });

  describe('addConfigChangeListener', () => {
    it('registers a listener that fires the handler when the matching config changes', () => {
      const handler = vi.fn();

      addConfigChangeListener('iconPack', handler, 'github.com');

      expect(mockAddListener).toHaveBeenCalledTimes(1);

      // Simulate the listener being called with matching changes
      const listener = mockAddListener.mock.calls[0][0];
      listener({
        'github.com:iconPack': { newValue: 'angular', oldValue: 'react' },
      });

      expect(handler).toHaveBeenCalledWith('angular');
    });

    it('does NOT fire the handler for unrelated config changes', () => {
      const handler = vi.fn();

      addConfigChangeListener('iconPack', handler, 'github.com');

      const listener = mockAddListener.mock.calls[0][0];

      // Simulate a change to a different config key
      listener({
        'github.com:iconSize': { newValue: 'lg', oldValue: 'md' },
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it('does NOT fire the handler when newValue is undefined', () => {
      const handler = vi.fn();

      addConfigChangeListener('iconPack', handler, 'github.com');

      const listener = mockAddListener.mock.calls[0][0];

      // Simulate a change where the key exists but newValue is undefined
      listener({
        'github.com:iconPack': { oldValue: 'react' },
      });

      expect(handler).not.toHaveBeenCalled();
    });
  });
});
