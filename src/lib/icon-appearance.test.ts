import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initIconAppearance, normalizePercentage } from './icon-appearance';

const mockGet = vi.fn();
const mockAddListener = vi.fn();

vi.mock('webextension-polyfill', () => ({
  default: {
    storage: {
      sync: { get: (...args: unknown[]) => mockGet(...args) },
      onChanged: {
        addListener: (...args: unknown[]) => mockAddListener(...args),
      },
    },
  },
}));

describe('icon appearance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.removeAttribute('style');
    Object.defineProperty(window, 'location', {
      value: { hostname: 'github.com' },
      writable: true,
    });
  });

  it('clamps percentages', () => {
    expect(normalizePercentage(-1)).toBe(0);
    expect(normalizePercentage(50)).toBe(50);
    expect(normalizePercentage(101)).toBe(100);
    expect(normalizePercentage('invalid')).toBe(100);
  });

  it('sets saturation and opacity CSS properties', async () => {
    mockGet
      .mockResolvedValueOnce({
        'github.com:iconSaturation': 40,
        'default:iconSaturation': 100,
      })
      .mockResolvedValueOnce({
        'github.com:iconOpacity': 65,
        'default:iconOpacity': 100,
      });

    initIconAppearance();
    await vi.waitFor(() => {
      expect(
        document.documentElement.style.getPropertyValue(
          '--material-icons-extension-saturation'
        )
      ).toBe('0.4');
    });
    expect(
      document.documentElement.style.getPropertyValue(
        '--material-icons-extension-opacity'
      )
    ).toBe('0.65');
  });
});
