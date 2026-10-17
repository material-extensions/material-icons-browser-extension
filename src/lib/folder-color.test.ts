import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FOLDER_COLOR,
  decorateGenericIcon,
  folderColorFilter,
  normalizeFolderColor,
} from './folder-color';

describe('folder color', () => {
  it('normalizes valid colors and rejects invalid values', () => {
    expect(normalizeFolderColor('#ABC')).toBe('#aabbcc');
    expect(normalizeFolderColor('#123456')).toBe('#123456');
    expect(normalizeFolderColor('red')).toBe(DEFAULT_FOLDER_COLOR);
  });

  it('does not filter the default color', () => {
    expect(folderColorFilter(DEFAULT_FOLDER_COLOR)).toBe('');
  });

  it('creates a stable filter for custom colors', () => {
    const filter = folderColorFilter('#ff0000');
    expect(filter).toContain('hue-rotate');
    expect(folderColorFilter('#ff0000')).toBe(filter);
  });

  it('decorates generic folder and file icons and clears stale state', () => {
    const icon = document.createElement('img');
    decorateGenericIcon(icon, 'folder.svg', '#ff0000');
    expect(
      icon.hasAttribute('data-material-icons-extension-generic-folder')
    ).toBe(true);
    expect(
      icon.style.getPropertyValue('--material-icons-extension-color-filter')
    ).not.toBe('');

    decorateGenericIcon(icon, 'file.svg', '#ff0000', '#00ff00');
    expect(
      icon.hasAttribute('data-material-icons-extension-generic-file')
    ).toBe(true);
    expect(
      icon.hasAttribute('data-material-icons-extension-generic-folder')
    ).toBe(false);

    decorateGenericIcon(icon, 'typescript.svg', '#ff0000', '#00ff00');
    expect(
      icon.hasAttribute('data-material-icons-extension-generic-folder')
    ).toBe(false);
    expect(
      icon.style.getPropertyValue('--material-icons-extension-color-filter')
    ).toBe('');
  });
});
