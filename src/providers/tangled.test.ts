import { describe, it, expect, beforeEach } from 'vitest';
import tangled from './tangled';

describe('Tangled provider', () => {
  const provider = tangled();

  beforeEach(() => {
    document.body.innerHTML = '';
    document.documentElement.className = '';
  });

  describe('basic properties', () => {
    it('should have name "tangled"', () => {
      expect(provider.name).toBe('tangled');
    });

    it('should have domain host "tangled.org"', () => {
      expect(provider.domains[0].host).toBe('tangled.org');
    });

    it('should match "tangled.org" with the regex', () => {
      expect(provider.domains[0].test.test('tangled.org')).toBe(true);
    });

    it('should not match other domains', () => {
      expect(provider.domains[0].test.test('nottangled.org')).toBe(false);
      expect(provider.domains[0].test.test('tangled.org.evil.com')).toBe(
        false
      );
    });

    it('should not be able to self host', () => {
      expect(provider.canSelfHost).toBe(false);
    });

    it('should not be custom', () => {
      expect(provider.isCustom).toBe(false);
    });
  });

  describe('getIsLightTheme', () => {
    it('should return false when html has "dark" class', () => {
      document.documentElement.classList.add('dark');
      expect(provider.getIsLightTheme()).toBe(false);
    });

    it('should return true when html does not have "dark" class and prefers-color-scheme is light', () => {
      document.documentElement.classList.remove('dark');
      // jsdom defaults to no dark preference
      Object.defineProperty(window, 'matchMedia', {
        value: (query: string) => ({
          matches: query === '(prefers-color-scheme: dark)' ? false : false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }),
        configurable: true,
      });

      expect(provider.getIsLightTheme()).toBe(true);
    });

    it('should return false when html does not have "dark" class but prefers-color-scheme is dark', () => {
      document.documentElement.classList.remove('dark');
      Object.defineProperty(window, 'matchMedia', {
        value: (query: string) => ({
          matches: query === '(prefers-color-scheme: dark)' ? true : false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }),
        configurable: true,
      });

      expect(provider.getIsLightTheme()).toBe(false);
    });
  });

  describe('getIsDirectory', () => {
    it('should return true when icon has "fill-current" class', () => {
      document.body.innerHTML =
        '<div class="grid"><svg class="fill-current"></svg></div>';
      const row = document.querySelector('.grid') as HTMLElement;
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsDirectory({ row, icon })).toBe(true);
    });

    it('should return true when row has "tree-directory" class', () => {
      document.body.innerHTML =
        '<div class="tree-directory"><svg></svg></div>';
      const row = document.querySelector('.tree-directory') as HTMLElement;
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsDirectory({ row, icon })).toBe(true);
    });

    it('should return true when icon contains folder SVG path', () => {
      document.body.innerHTML = `
        <div class="grid">
          <svg><path d="M20 20a2 something"></path></svg>
        </div>
      `;
      const row = document.querySelector('.grid') as HTMLElement;
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsDirectory({ row, icon })).toBe(true);
    });

    it('should return false for file icons', () => {
      document.body.innerHTML =
        '<div class="grid"><svg class="text-muted"><path d="M5 3"></path></svg></div>';
      const row = document.querySelector('.grid') as HTMLElement;
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsDirectory({ row, icon })).toBe(false);
    });
  });

  describe('getIsSubmodule', () => {
    it('should always return false', () => {
      const row = document.createElement('div');
      const icon = document.createElement('svg') as unknown as HTMLElement;
      expect(provider.getIsSubmodule({ row, icon })).toBe(false);
    });
  });

  describe('getIsSymlink', () => {
    it('should always return false', () => {
      const row = document.createElement('div');
      const icon = document.createElement('svg') as unknown as HTMLElement;
      expect(provider.getIsSymlink({ row, icon })).toBe(false);
    });
  });

  describe('replaceIcon', () => {
    it('should copy attributes from old SVG to new element', () => {
      document.body.innerHTML =
        '<div><svg class="w-4 h-4 text-muted" viewBox="0 0 16 16"></svg></div>';
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('svg') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.getAttribute('viewBox')).toBe('0 0 16 16');
    });

    it('should NOT copy "src" attribute', () => {
      document.body.innerHTML = '<div><svg src="old.svg"></svg></div>';
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('svg') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.getAttribute('src')).toBeNull();
    });

    it('should NOT copy "data-material-icons-extension-*" attributes', () => {
      document.body.innerHTML =
        '<div><svg data-material-icons-extension="icon" data-material-icons-extension-iconname="test.svg"></svg></div>';
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

    it('should strip "group-open/" prefixed classes from newSVG', () => {
      document.body.innerHTML =
        '<div><svg class="w-4 h-4 group-open/folder:hidden"></svg></div>';
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('svg') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.className).not.toContain('group-open/');
    });

    it('should strip "hidden" class from newSVG', () => {
      document.body.innerHTML =
        '<div><svg class="w-4 h-4 hidden"></svg></div>';
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('svg') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.className).not.toContain('hidden');
      expect(newSVG.className).toContain('w-4');
      expect(newSVG.className).toContain('h-4');
    });

    it('should hide the sibling SVG if present', () => {
      document.body.innerHTML = `
        <div>
          <svg class="w-4 h-4 group-open/folder:hidden"></svg>
          <svg class="w-4 h-4 group-open/folder:block"></svg>
        </div>
      `;
      const svgEl = document.querySelectorAll(
        'svg'
      )[0] as unknown as HTMLElement;
      const sibling = document.querySelectorAll(
        'svg'
      )[1] as unknown as HTMLElement;
      const newSVG = document.createElement('svg') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(sibling.style.display).toBe('none');
    });

    it('should NOT hide the sibling if it has data-material-icons-extension attribute', () => {
      document.body.innerHTML = `
        <div>
          <svg class="w-4 h-4"></svg>
          <svg class="w-4 h-4" data-material-icons-extension="icon"></svg>
        </div>
      `;
      const svgEl = document.querySelectorAll(
        'svg'
      )[0] as unknown as HTMLElement;
      const sibling = document.querySelectorAll(
        'svg'
      )[1] as unknown as HTMLElement;
      const newSVG = document.createElement('svg') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(sibling.style.display).not.toBe('none');
    });

    it('should NOT hide the sibling if it is not an SVG', () => {
      document.body.innerHTML = `
        <div>
          <svg class="w-4 h-4"></svg>
          <span class="label">filename</span>
        </div>
      `;
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const span = document.querySelector('span') as HTMLElement;
      const newSVG = document.createElement('svg') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(span.style.display).not.toBe('none');
    });

    it('should replace the old element in the DOM via parentNode.replaceChild', () => {
      document.body.innerHTML =
        '<div class="container"><svg class="w-4 h-4"></svg></div>';
      const container = document.querySelector('.container') as HTMLElement;
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('svg') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(container.contains(svgEl)).toBe(false);
      expect(container.contains(newSVG)).toBe(true);
    });
  });

  describe('onAdd', () => {
    it('should be a no-op function', () => {
      const row = document.createElement('div');
      const callback = () => {};
      expect(() => provider.onAdd(row, callback)).not.toThrow();
    });
  });

  describe('transformFileName', () => {
    it('should pass through filename unchanged', () => {
      const row = document.createElement('div');
      const icon = document.createElement('svg') as unknown as HTMLElement;
      expect(provider.transformFileName(row, icon, 'index.ts')).toBe(
        'index.ts'
      );
    });
  });
});
