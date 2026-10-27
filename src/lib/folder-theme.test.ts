import { describe, expect, it } from 'vitest';
import { normalizeFolderTheme } from './folder-theme';

describe('normalizeFolderTheme', () => {
  it.each(['specific', 'classic'] as const)('accepts %s', (folderTheme) => {
    expect(normalizeFolderTheme(folderTheme)).toBe(folderTheme);
  });

  it('falls back to specific for invalid values', () => {
    expect(normalizeFolderTheme('invalid')).toBe('specific');
    expect(normalizeFolderTheme('none')).toBe('specific');
    expect(normalizeFolderTheme(undefined)).toBe('specific');
  });
});
