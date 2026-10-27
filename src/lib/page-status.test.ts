import { beforeEach, describe, expect, it } from 'vitest';
import { setExtensionProvider, setExtensionStatus } from './page-status';

describe('page-status', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute(
      'data-material-icons-extension-status'
    );
    document.documentElement.removeAttribute(
      'data-material-icons-extension-provider'
    );
  });

  it('sets and clears the extension status attribute', () => {
    setExtensionStatus('loading');

    expect(
      document.documentElement.getAttribute(
        'data-material-icons-extension-status'
      )
    ).toBe('loading');

    setExtensionStatus(null);

    expect(
      document.documentElement.hasAttribute(
        'data-material-icons-extension-status'
      )
    ).toBe(false);
  });

  it('sets and clears the extension provider attribute', () => {
    setExtensionProvider('forgejo');

    expect(
      document.documentElement.getAttribute(
        'data-material-icons-extension-provider'
      )
    ).toBe('forgejo');

    setExtensionProvider(null);

    expect(
      document.documentElement.hasAttribute(
        'data-material-icons-extension-provider'
      )
    ).toBe(false);
  });
});
