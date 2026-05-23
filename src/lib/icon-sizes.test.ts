import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let mockIconSize = 'md';

vi.mock('./user-config', () => ({
  getConfig: vi.fn(() => Promise.resolve(mockIconSize)),
  addConfigChangeListener: vi.fn(),
}));

import { iconSizes, initIconSizes } from './icon-sizes';
import { addConfigChangeListener } from './user-config';

describe('icon-sizes', () => {
  beforeEach(() => {
    mockIconSize = 'md';
    document.body.removeAttribute('data-material-icons-extension-size');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('iconSizes contains expected values', () => {
    expect(iconSizes).toEqual(['sm', 'md', 'lg', 'xl']);
  });

  it('initIconSizes registers a DOMContentLoaded event listener', () => {
    const spy = vi.spyOn(document, 'addEventListener');
    initIconSizes();
    expect(spy).toHaveBeenCalledWith(
      'DOMContentLoaded',
      expect.any(Function),
      false
    );
  });

  it('initIconSizes calls addConfigChangeListener for iconSize', () => {
    initIconSizes();
    expect(addConfigChangeListener).toHaveBeenCalledWith(
      'iconSize',
      expect.any(Function)
    );
    expect(addConfigChangeListener).toHaveBeenCalledWith(
      'iconSize',
      expect.any(Function),
      'default'
    );
  });

  it('after DOMContentLoaded fires, body gets the correct data-material-icons-extension-size attribute', async () => {
    mockIconSize = 'lg';
    initIconSizes();

    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);

    // Wait for the promise returned by getConfig to resolve
    await vi.waitFor(() => {
      expect(document.body.getAttribute('data-material-icons-extension-size')).toBe('lg');
    });
  });

  it('the attribute is restored if removed from body (via MutationObserver)', async () => {
    mockIconSize = 'xl';
    initIconSizes();

    // Fire DOMContentLoaded to set up the MutationObserver
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);

    await vi.waitFor(() => {
      expect(document.body.getAttribute('data-material-icons-extension-size')).toBe('xl');
    });

    // Remove the attribute to trigger the MutationObserver
    document.body.removeAttribute('data-material-icons-extension-size');

    await vi.waitFor(() => {
      expect(document.body.getAttribute('data-material-icons-extension-size')).toBe('xl');
    });
  });
});
