import { describe, it, expect, beforeEach } from 'vitest';
import forgejo from './forgejo';

describe('Forgejo provider', () => {
  const provider = forgejo();

  it('should have name "forgejo"', () => {
    expect(provider.name).toBe('forgejo');
  });

  describe('domains', () => {
    it('should have codeberg.org as host', () => {
      expect(provider.domains[0].host).toBe('codeberg.org');
    });

    it('should match codeberg.org with test regex', () => {
      expect(provider.domains[0].test.test('codeberg.org')).toBe(true);
    });

    it('should not match other hosts', () => {
      expect(provider.domains[0].test.test('notcodeberg.org')).toBe(false);
    });
  });

  it('should allow self-hosting', () => {
    expect(provider.canSelfHost).toBe(true);
  });

  describe('getIsLightTheme', () => {
    it('should always return false', () => {
      expect(provider.getIsLightTheme()).toBe(false);
    });
  });

  describe('getIsDirectory', () => {
    it('should return true when icon has octicon-file-directory-fill class', () => {
      document.body.innerHTML =
        '<svg class="octicon-file-directory-fill"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsDirectory({ row: document.body, icon })).toBe(true);
    });

    it('should return false when icon lacks directory class', () => {
      document.body.innerHTML = '<svg class="octicon-file"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsDirectory({ row: document.body, icon })).toBe(
        false
      );
    });
  });

  describe('getIsSubmodule', () => {
    it('should return true when icon has octicon-file-submodule class', () => {
      document.body.innerHTML = '<svg class="octicon-file-submodule"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsSubmodule({ row: document.body, icon })).toBe(true);
    });

    it('should return false when icon lacks submodule class', () => {
      document.body.innerHTML = '<svg class="octicon-file"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsSubmodule({ row: document.body, icon })).toBe(
        false
      );
    });
  });

  describe('getIsSymlink', () => {
    it('should return true when icon has octicon-file-symlink-file class', () => {
      document.body.innerHTML =
        '<svg class="octicon-file-symlink-file"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsSymlink({ row: document.body, icon })).toBe(true);
    });

    it('should return false when icon lacks symlink class', () => {
      document.body.innerHTML = '<svg class="octicon-file"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsSymlink({ row: document.body, icon })).toBe(false);
    });
  });

  describe('replaceIcon', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('should copy attributes except src and data-material-icons-extension-*', () => {
      document.body.innerHTML =
        '<div><svg class="octicon" viewBox="0 0 16 16" width="16" height="16"></svg></div>';
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('svg') as unknown as HTMLElement;
      newSVG.setAttribute('src', 'icon.svg');
      newSVG.setAttribute('data-material-icons-extension', 'icon');
      newSVG.setAttribute(
        'data-material-icons-extension-iconname',
        'typescript.svg'
      );

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.getAttribute('class')).toBe('octicon');
      expect(newSVG.getAttribute('viewBox')).toBe('0 0 16 16');
      expect(newSVG.getAttribute('width')).toBe('16');
      expect(newSVG.getAttribute('height')).toBe('16');
    });

    it('should not copy src attribute to newSVG', () => {
      document.body.innerHTML =
        '<div><svg src="old.svg" class="octicon"></svg></div>';
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('svg') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.getAttribute('src')).toBeNull();
    });

    it('should not copy data-material-icons-extension-* attributes to newSVG', () => {
      document.body.innerHTML =
        '<div><svg data-material-icons-extension="icon" data-material-icons-extension-iconname="old.svg" class="octicon"></svg></div>';
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('svg') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.getAttribute('data-material-icons-extension')).toBeNull();
      expect(
        newSVG.getAttribute('data-material-icons-extension-iconname')
      ).toBeNull();
      expect(newSVG.getAttribute('class')).toBe('octicon');
    });

    it('should replace element in DOM via parentNode.replaceChild', () => {
      document.body.innerHTML =
        '<div class="container"><svg class="octicon"></svg></div>';
      const container = document.querySelector('.container') as HTMLElement;
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('svg') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(container.contains(newSVG)).toBe(true);
      expect(container.contains(svgEl)).toBe(false);
    });
  });

  describe('transformFileName', () => {
    it('should pass through normal filenames unchanged', () => {
      const row = document.createElement('div');
      const icon = document.createElement('svg');
      expect(provider.transformFileName(row, icon, 'index.ts')).toBe(
        'index.ts'
      );
    });

    it('should transform Source code archive names when row has .archive-link', () => {
      const row = document.createElement('div');
      row.innerHTML = '<a class="archive-link" href="#"></a>';
      const icon = document.createElement('svg');
      expect(
        provider.transformFileName(row, icon, 'Source code (zip)')
      ).toBe('Source code.zip');
    });

    it('should not transform Source code names without .archive-link', () => {
      const row = document.createElement('div');
      const icon = document.createElement('svg');
      expect(
        provider.transformFileName(row, icon, 'Source code (zip)')
      ).toBe('Source code (zip)');
    });
  });
});
