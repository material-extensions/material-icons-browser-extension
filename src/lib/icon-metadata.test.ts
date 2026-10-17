import { describe, expect, it } from 'vitest';
import { syncIconMetadata } from './icon-metadata';

describe('syncIconMetadata', () => {
  it('copies extension metadata and removes stale metadata', () => {
    const source = document.createElement('img');
    source.setAttribute('data-material-icons-extension', 'icon');
    source.setAttribute('data-material-icons-extension-directory', 'true');
    source.setAttribute('class', 'source');

    const target = document.createElement('svg');
    target.setAttribute('data-material-icons-extension-folder-hidden', '');
    target.setAttribute('class', 'target');

    syncIconMetadata(source, target);

    expect(target.getAttribute('data-material-icons-extension')).toBe('icon');
    expect(target.getAttribute('data-material-icons-extension-directory')).toBe(
      'true'
    );
    expect(
      target.hasAttribute('data-material-icons-extension-folder-hidden')
    ).toBe(false);
    expect(target.getAttribute('class')).toBe('target');
  });
});
