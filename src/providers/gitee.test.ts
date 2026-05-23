import { describe, it, expect, beforeEach } from 'vitest';
import gitee from './gitee';

describe('Gitee provider', () => {
  const provider = gitee();

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('basic properties', () => {
    it('should have name "gitee"', () => {
      expect(provider.name).toBe('gitee');
    });

    it('should have domain host "gitee.com"', () => {
      expect(provider.domains[0].host).toBe('gitee.com');
    });

    it('should match "gitee.com" with the regex', () => {
      expect(provider.domains[0].test.test('gitee.com')).toBe(true);
    });

    it('should not match other domains', () => {
      expect(provider.domains[0].test.test('notgitee.com')).toBe(false);
      expect(provider.domains[0].test.test('gitee.com.evil.com')).toBe(false);
    });

    it('should not be able to self host', () => {
      expect(provider.canSelfHost).toBe(false);
    });

    it('should not be custom', () => {
      expect(provider.isCustom).toBe(false);
    });
  });

  describe('getIsLightTheme', () => {
    it('should always return true (no dark theme available)', () => {
      expect(provider.getIsLightTheme()).toBe(true);
    });
  });

  describe('getIsDirectory', () => {
    it('should return true when icon has "icon-folders" class', () => {
      document.body.innerHTML = '<i class="iconfont icon-folders"></i>';
      const icon = document.querySelector('i') as HTMLElement;
      expect(provider.getIsDirectory({ row: document.body, icon })).toBe(true);
    });

    it('should return false when icon does not have "icon-folders" class', () => {
      document.body.innerHTML = '<i class="iconfont icon-file"></i>';
      const icon = document.querySelector('i') as HTMLElement;
      expect(provider.getIsDirectory({ row: document.body, icon })).toBe(false);
    });
  });

  describe('getIsSubmodule', () => {
    it('should return true when icon has "icon-submodule" class', () => {
      document.body.innerHTML = '<i class="iconfont icon-submodule"></i>';
      const icon = document.querySelector('i') as HTMLElement;
      expect(provider.getIsSubmodule({ row: document.body, icon })).toBe(true);
    });

    it('should return false when icon does not have "icon-submodule" class', () => {
      document.body.innerHTML = '<i class="iconfont icon-file"></i>';
      const icon = document.querySelector('i') as HTMLElement;
      expect(provider.getIsSubmodule({ row: document.body, icon })).toBe(false);
    });
  });

  describe('getIsSymlink', () => {
    it('should return true when icon has "icon-file-shortcut" class', () => {
      document.body.innerHTML = '<i class="iconfont icon-file-shortcut"></i>';
      const icon = document.querySelector('i') as HTMLElement;
      expect(provider.getIsSymlink({ row: document.body, icon })).toBe(true);
    });

    it('should return false when icon does not have "icon-file-shortcut" class', () => {
      document.body.innerHTML = '<i class="iconfont icon-file"></i>';
      const icon = document.querySelector('i') as HTMLElement;
      expect(provider.getIsSymlink({ row: document.body, icon })).toBe(false);
    });
  });

  describe('replaceIcon', () => {
    it('should copy attributes from old element to new element', () => {
      document.body.innerHTML =
        '<div><i class="iconfont icon-file" data-custom="value"></i></div>';
      const svgEl = document.querySelector('i') as HTMLElement;
      const newSVG = document.createElement('img') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.getAttribute('class')).toBe('iconfont icon-file');
      expect(newSVG.getAttribute('data-custom')).toBe('value');
    });

    it('should NOT copy "src" attribute', () => {
      document.body.innerHTML = '<div><i src="old.svg"></i></div>';
      const svgEl = document.querySelector('i') as HTMLElement;
      const newSVG = document.createElement('img') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.getAttribute('src')).toBeNull();
    });

    it('should NOT copy "data-material-icons-extension-*" attributes', () => {
      document.body.innerHTML =
        '<div><i data-material-icons-extension="icon" data-material-icons-extension-iconname="test.svg"></i></div>';
      const svgEl = document.querySelector('i') as HTMLElement;
      const newSVG = document.createElement('img') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(
        newSVG.getAttribute('data-material-icons-extension')
      ).toBeNull();
      expect(
        newSVG.getAttribute('data-material-icons-extension-iconname')
      ).toBeNull();
    });

    it('should set height to 28px and width to 18px', () => {
      document.body.innerHTML = '<div><i class="iconfont"></i></div>';
      const svgEl = document.querySelector('i') as HTMLElement;
      const newSVG = document.createElement('img') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.style.height).toBe('28px');
      expect(newSVG.style.width).toBe('18px');
    });

    it('should replace the old element in the DOM via parentNode.replaceChild', () => {
      document.body.innerHTML =
        '<div class="container"><i class="iconfont icon-file"></i></div>';
      const container = document.querySelector('.container') as HTMLElement;
      const svgEl = document.querySelector('i') as HTMLElement;
      const newSVG = document.createElement('img') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(container.contains(svgEl)).toBe(false);
      expect(container.contains(newSVG)).toBe(true);
    });
  });

  describe('onAdd', () => {
    it('should be a no-op function', () => {
      const row = document.createElement('div');
      const callback = () => {};
      // Should not throw
      expect(() => provider.onAdd(row, callback)).not.toThrow();
    });
  });

  describe('transformFileName', () => {
    it('should pass through normal filenames unchanged', () => {
      const row = document.createElement('div');
      const icon = document.createElement('i');
      expect(provider.transformFileName(row, icon, 'index.ts')).toBe(
        'index.ts'
      );
    });

    it('should transform "Source code (zip)" to "Source code.zip" when row has "item" class', () => {
      const row = document.createElement('div');
      row.classList.add('item');
      const icon = document.createElement('i');
      expect(
        provider.transformFileName(row, icon, 'Source code (zip)')
      ).toBe('Source code.zip');
    });

    it('should transform "Source code (tar.gz)" to "Source code.tar.gz" when row has "item" class', () => {
      const row = document.createElement('div');
      row.classList.add('item');
      const icon = document.createElement('i');
      expect(
        provider.transformFileName(row, icon, 'Source code (tar.gz)')
      ).toBe('Source code.tar.gz');
    });

    it('should NOT transform "Source code (zip)" when row does not have "item" class', () => {
      const row = document.createElement('div');
      const icon = document.createElement('i');
      expect(
        provider.transformFileName(row, icon, 'Source code (zip)')
      ).toBe('Source code (zip)');
    });

    it('should NOT transform a filename that does not include "Source code"', () => {
      const row = document.createElement('div');
      row.classList.add('item');
      const icon = document.createElement('i');
      expect(provider.transformFileName(row, icon, 'archive (zip)')).toBe(
        'archive (zip)'
      );
    });
  });
});
