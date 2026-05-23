import { describe, it, expect, beforeEach } from 'vitest';
import gitlab from './gitlab';

describe('GitLab provider', () => {
  const provider = gitlab();

  beforeEach(() => {
    document.body.innerHTML = '';
    document.body.className = '';
  });

  describe('basic properties', () => {
    it('should have name "gitlab"', () => {
      expect(provider.name).toBe('gitlab');
    });

    it('should have domain host "gitlab.com"', () => {
      expect(provider.domains[0].host).toBe('gitlab.com');
    });

    it('should match "gitlab.com" with the regex', () => {
      expect(provider.domains[0].test.test('gitlab.com')).toBe(true);
    });

    it('should not match other domains with the regex', () => {
      expect(provider.domains[0].test.test('notgitlab.com')).toBe(false);
      expect(provider.domains[0].test.test('gitlab.com.evil.com')).toBe(false);
    });
  });

  describe('getIsLightTheme', () => {
    it('should return true when body does not have "gl-dark" class', () => {
      document.body.classList.remove('gl-dark');
      expect(provider.getIsLightTheme()).toBe(true);
    });

    it('should return false when body has "gl-dark" class', () => {
      document.body.classList.add('gl-dark');
      expect(provider.getIsLightTheme()).toBe(false);
    });
  });

  describe('getIsDirectory', () => {
    it('should return true when icon has data-testid="folder-icon"', () => {
      document.body.innerHTML = '<svg data-testid="folder-icon"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsDirectory({ row: document.body, icon })).toBe(true);
    });

    it('should return false for file icons', () => {
      document.body.innerHTML = '<svg data-testid="doc-code-icon"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsDirectory({ row: document.body, icon })).toBe(
        false
      );
    });
  });

  describe('getIsSubmodule', () => {
    it('should detect submodule via is-submodule class on link', () => {
      document.body.innerHTML = `
        <div class="tree-item">
          <a class="is-submodule" href="#">submod</a>
        </div>
      `;
      const row = document.querySelector('.tree-item') as HTMLElement;
      const icon = document.createElement('svg') as unknown as HTMLElement;
      expect(provider.getIsSubmodule({ row, icon })).toBe(true);
    });

    it('should return false when no submodule indicators exist', () => {
      document.body.innerHTML = `
        <div class="tree-item">
          <a href="#">file.ts</a>
        </div>
      `;
      const row = document.querySelector('.tree-item') as HTMLElement;
      const icon = document.createElement('svg') as unknown as HTMLElement;
      expect(provider.getIsSubmodule({ row, icon })).toBe(false);
    });
  });

  describe('getIsSymlink', () => {
    it('should return true when icon has data-testid="symlink-icon"', () => {
      document.body.innerHTML = '<svg data-testid="symlink-icon"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsSymlink({ row: document.body, icon })).toBe(true);
    });

    it('should return false for non-symlink icons', () => {
      document.body.innerHTML = '<svg data-testid="doc-code-icon"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsSymlink({ row: document.body, icon })).toBe(false);
    });
  });

  describe('replaceIcon', () => {
    it('should copy attributes from old SVG to new element', () => {
      document.body.innerHTML =
        '<svg class="gl-icon" viewBox="0 0 16 16"></svg>';
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('svg') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.getAttribute('class')).toBe('gl-icon');
      expect(newSVG.getAttribute('viewBox')).toBe('0 0 16 16');
    });

    it('should NOT copy "src" attribute', () => {
      document.body.innerHTML = '<svg src="old.svg"></svg>';
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('svg') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.getAttribute('src')).toBeNull();
    });

    it('should NOT copy "data-material-icons-extension-*" attributes', () => {
      document.body.innerHTML =
        '<svg data-material-icons-extension="icon" data-material-icons-extension-iconname="test.svg"></svg>';
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('svg') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(
        newSVG.getAttribute('data-material-icons-extension')
      ).toBeNull();
      expect(
        newSVG.getAttribute('data-material-icons-extension-iconname')
      ).toBeNull();
    });

    it('should set width and height to 16px', () => {
      document.body.innerHTML = '<svg class="gl-icon"></svg>';
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('svg') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.style.height).toBe('16px');
      expect(newSVG.style.width).toBe('16px');
    });

    it('should replace the old element in the DOM', () => {
      document.body.innerHTML =
        '<div class="container"><svg class="gl-icon"></svg></div>';
      const container = document.querySelector('.container') as HTMLElement;
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('svg') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(container.contains(svgEl)).toBe(false);
      expect(container.contains(newSVG)).toBe(true);
    });
  });

  describe('transformFileName', () => {
    it('should pass through normal filenames unchanged', () => {
      const row = document.createElement('div');
      const icon = document.createElement('svg') as unknown as HTMLElement;
      expect(provider.transformFileName(row, icon, 'index.ts')).toBe(
        'index.ts'
      );
    });

    it('should transform "Source code (zip)" on release asset rows', () => {
      document.body.innerHTML = `
        <div class="js-assets-list">
          <ul>
            <li><span>Source code (zip)</span></li>
          </ul>
        </div>
      `;
      const li = document.querySelector('li') as HTMLElement;
      const icon = document.createElement('svg') as unknown as HTMLElement;
      expect(
        provider.transformFileName(li, icon, 'Source code (zip)')
      ).toBe('Source code.zip');
    });

    it('should transform "Source code (tar.gz)" on release asset rows', () => {
      document.body.innerHTML = `
        <div class="js-assets-list">
          <ul>
            <li><span>Source code (tar.gz)</span></li>
          </ul>
        </div>
      `;
      const li = document.querySelector('li') as HTMLElement;
      const icon = document.createElement('svg') as unknown as HTMLElement;
      expect(
        provider.transformFileName(li, icon, 'Source code (tar.gz)')
      ).toBe('Source code.tar.gz');
    });
  });
});
