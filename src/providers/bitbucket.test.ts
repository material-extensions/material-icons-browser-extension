import { describe, it, expect, beforeEach } from 'vitest';
import bitbucket from './bitbucket';

describe('Bitbucket provider', () => {
  const provider = bitbucket();

  it('should have name "bitbucket"', () => {
    expect(provider.name).toBe('bitbucket');
  });

  describe('domains', () => {
    it('should have bitbucket.org as host', () => {
      expect(provider.domains[0].host).toBe('bitbucket.org');
    });

    it('should match bitbucket.org with regex', () => {
      expect(provider.domains[0].test.test('bitbucket.org')).toBe(true);
    });

    it('should not match other hosts with regex', () => {
      expect(provider.domains[0].test.test('notbitbucket.org')).toBe(false);
      expect(provider.domains[0].test.test('bitbucket.org.evil.com')).toBe(
        false
      );
    });
  });

  describe('getIsLightTheme', () => {
    it('should return true when no dark mode is available', () => {
      expect(provider.getIsLightTheme()).toBe(true);
    });

    it('should return true regardless of data-color-mode attribute', () => {
      document.documentElement.setAttribute('data-color-mode', 'dark');
      expect(provider.getIsLightTheme()).toBe(true);
      document.documentElement.removeAttribute('data-color-mode');
    });
  });

  describe('getIsDirectory', () => {
    it('should detect directory from parent aria-label', () => {
      document.body.innerHTML =
        '<a aria-label="Directory,"><svg class="icon"></svg></a>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsDirectory({ row: document.body, icon })).toBe(true);
    });

    it('should return false for non-directory', () => {
      document.body.innerHTML =
        '<a aria-label="File,"><svg class="icon"></svg></a>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsDirectory({ row: document.body, icon })).toBe(
        false
      );
    });
  });

  describe('getIsSubmodule', () => {
    it('should detect submodule from parent aria-label', () => {
      document.body.innerHTML =
        '<a aria-label="Submodule,"><svg class="icon"></svg></a>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsSubmodule({ row: document.body, icon })).toBe(true);
    });

    it('should return false for non-submodule', () => {
      document.body.innerHTML =
        '<a aria-label="File,"><svg class="icon"></svg></a>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsSubmodule({ row: document.body, icon })).toBe(
        false
      );
    });
  });

  describe('getIsSymlink', () => {
    it('should always return false', () => {
      const icon = document.createElement('span');
      expect(provider.getIsSymlink({ row: document.body, icon })).toBe(false);
    });
  });

  describe('replaceIcon', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('should set overflow, pointerEvents, maxHeight, maxWidth, verticalAlign styles', () => {
      document.body.innerHTML = `
        <div>
          <svg class="icon" viewBox="0 0 16 16"></svg>
        </div>
      `;
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      ) as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.style.overflow).toBe('hidden');
      expect(newSVG.style.pointerEvents).toBe('none');
      expect(newSVG.style.maxHeight).toBe('100%');
      expect(newSVG.style.maxWidth).toBe('100%');
      expect(newSVG.style.verticalAlign).toBe('bottom');
    });

    it('should copy attributes except src and data-material-icons-extension-*', () => {
      document.body.innerHTML = `
        <div>
          <svg class="icon" viewBox="0 0 16 16" src="old.svg" data-material-icons-extension="icon" aria-hidden="true"></svg>
        </div>
      `;
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      ) as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.getAttribute('class')).toBe('icon');
      expect(newSVG.getAttribute('viewBox')).toBe('0 0 16 16');
      expect(newSVG.getAttribute('aria-hidden')).toBe('true');
      expect(newSVG.getAttribute('src')).toBeNull();
      expect(
        newSVG.getAttribute('data-material-icons-extension')
      ).toBeNull();
    });

    it('should replace the element in DOM', () => {
      document.body.innerHTML = `
        <div class="container">
          <svg class="old-icon" viewBox="0 0 16 16"></svg>
        </div>
      `;
      const container = document.querySelector('.container') as HTMLElement;
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      ) as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(container.contains(svgEl)).toBe(false);
      expect(container.contains(newSVG)).toBe(true);
    });
  });

  describe('transformFileName', () => {
    it('should pass through filename unchanged', () => {
      const row = document.createElement('tr');
      const icon = document.createElement('svg') as unknown as HTMLElement;
      expect(provider.transformFileName(row, icon, 'index.ts')).toBe(
        'index.ts'
      );
    });
  });
});
