import { describe, it, expect, vi, beforeEach } from 'vitest';
import azure from './azure';

describe('Azure provider', () => {
  const provider = azure();

  beforeEach(() => {
    document.body.innerHTML = '';
    document.documentElement.className = '';
  });

  describe('basic properties', () => {
    it('should have name "azure"', () => {
      expect(provider.name).toBe('azure');
    });

    it('should have domain host "dev.azure.com"', () => {
      expect(provider.domains[0].host).toBe('dev.azure.com');
    });

    it('should have domain host "visualstudio.com"', () => {
      expect(provider.domains[1].host).toBe('visualstudio.com');
    });

    it('should match "dev.azure.com" with the regex', () => {
      expect(provider.domains[0].test.test('dev.azure.com')).toBe(true);
    });

    it('should not match other domains with the first regex', () => {
      expect(provider.domains[0].test.test('notdev.azure.com')).toBe(false);
      expect(provider.domains[0].test.test('dev.azure.com.evil.com')).toBe(
        false
      );
    });

    it('should match subdomains of visualstudio.com', () => {
      expect(provider.domains[1].test.test('myorg.visualstudio.com')).toBe(
        true
      );
    });

    it('should not match bare visualstudio.com without subdomain prefix', () => {
      // The regex is /.*\.visualstudio\.com$/ which requires at least one char + dot
      expect(provider.domains[1].test.test('visualstudio.com')).toBe(false);
    });
  });

  describe('getIsLightTheme', () => {
    it('should return true when computed color is rgba(0, 0, 0, 0.9)', () => {
      // Mock getComputedStyle via defaultView
      const mockGetComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: (prop: string) => {
          if (prop === 'color') return 'rgba(0, 0, 0, 0.9)';
          return '';
        },
      });
      Object.defineProperty(document, 'defaultView', {
        value: { getComputedStyle: mockGetComputedStyle },
        configurable: true,
      });

      expect(provider.getIsLightTheme()).toBe(true);
    });

    it('should return false when computed color is different', () => {
      const mockGetComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: (prop: string) => {
          if (prop === 'color') return 'rgba(255, 255, 255, 0.9)';
          return '';
        },
      });
      Object.defineProperty(document, 'defaultView', {
        value: { getComputedStyle: mockGetComputedStyle },
        configurable: true,
      });

      expect(provider.getIsLightTheme()).toBe(false);
    });
  });

  describe('getIsDirectory', () => {
    it('should return true when icon has "repos-folder-icon" class', () => {
      document.body.innerHTML = '<span class="repos-folder-icon"></span>';
      const icon = document.querySelector('span') as HTMLElement;
      expect(provider.getIsDirectory({ row: document.body, icon })).toBe(true);
    });

    it('should return false when icon does not have "repos-folder-icon" class', () => {
      document.body.innerHTML = '<span class="some-other-icon"></span>';
      const icon = document.querySelector('span') as HTMLElement;
      expect(provider.getIsDirectory({ row: document.body, icon })).toBe(false);
    });
  });

  describe('getIsSubmodule', () => {
    it('should always return false', () => {
      const row = document.createElement('div');
      const icon = document.createElement('span');
      expect(provider.getIsSubmodule({ row, icon })).toBe(false);
    });
  });

  describe('getIsSymlink', () => {
    it('should return true when icon has "ms-Icon--PageArrowRight" class', () => {
      document.body.innerHTML =
        '<span class="ms-Icon--PageArrowRight"></span>';
      const icon = document.querySelector('span') as HTMLElement;
      expect(provider.getIsSymlink({ row: document.body, icon })).toBe(true);
    });

    it('should return false when icon does not have "ms-Icon--PageArrowRight" class', () => {
      document.body.innerHTML = '<span class="some-icon"></span>';
      const icon = document.querySelector('span') as HTMLElement;
      expect(provider.getIsSymlink({ row: document.body, icon })).toBe(false);
    });
  });

  describe('replaceIcon', () => {
    it('should set display to inline-flex on the new SVG', () => {
      document.body.innerHTML =
        '<div><span class="icon-margin"><i class="old-icon"></i></span></div>';
      const svgEl = document.querySelector('.icon-margin') as HTMLElement;
      const newSVG = document.createElement('img');

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.style.display).toBe('inline-flex');
    });

    it('should set height and width to 1rem on the new SVG', () => {
      document.body.innerHTML =
        '<div><span class="icon-margin"><i class="old-icon"></i></span></div>';
      const svgEl = document.querySelector('.icon-margin') as HTMLElement;
      const newSVG = document.createElement('img');

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.style.height).toBe('1rem');
      expect(newSVG.style.width).toBe('1rem');
    });

    it('should add the HIDE_PSEUDO_CLASS to the container element', () => {
      document.body.innerHTML =
        '<div><span class="icon-margin"><i class="old-icon"></i></span></div>';
      const svgEl = document.querySelector('.icon-margin') as HTMLElement;
      const newSVG = document.createElement('img');

      provider.replaceIcon(svgEl, newSVG);

      expect(
        svgEl.classList.contains('material-icons-exension-hide-pseudo')
      ).toBe(true);
    });

    it('should not add HIDE_PSEUDO_CLASS twice', () => {
      document.body.innerHTML =
        '<div><span class="icon-margin material-icons-exension-hide-pseudo"><i class="old-icon"></i></span></div>';
      const svgEl = document.querySelector('.icon-margin') as HTMLElement;
      const newSVG = document.createElement('img');

      provider.replaceIcon(svgEl, newSVG);

      const classes = Array.from(svgEl.classList);
      const count = classes.filter(
        (c) => c === 'material-icons-exension-hide-pseudo'
      ).length;
      expect(count).toBe(1);
    });

    it('should replace the child node if container has children', () => {
      document.body.innerHTML =
        '<div><span class="icon-margin"><i class="old-icon"></i></span></div>';
      const svgEl = document.querySelector('.icon-margin') as HTMLElement;
      const newSVG = document.createElement('img');

      provider.replaceIcon(svgEl, newSVG);

      expect(svgEl.contains(newSVG)).toBe(true);
      expect(svgEl.querySelector('.old-icon')).toBeNull();
    });

    it('should append the new icon if container has no children', () => {
      document.body.innerHTML =
        '<div><span class="icon-margin"></span></div>';
      const svgEl = document.querySelector('.icon-margin') as HTMLElement;
      const newSVG = document.createElement('img');

      provider.replaceIcon(svgEl, newSVG);

      expect(svgEl.contains(newSVG)).toBe(true);
      expect(svgEl.childNodes.length).toBe(1);
    });
  });

  describe('onAdd', () => {
    it('should set up a MutationObserver on the row', () => {
      const row = document.createElement('tr');
      document.body.appendChild(row);
      const callback = vi.fn();

      provider.onAdd(row, callback);

      // Trigger a mutation that is NOT an IMG addition
      const span = document.createElement('span');
      row.appendChild(span);

      // MutationObserver is async, give it a tick
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(callback).toHaveBeenCalled();
          resolve();
        }, 0);
      });
    });

    it('should NOT call callback when the mutation adds an IMG node (extension mutation)', () => {
      const row = document.createElement('tr');
      document.body.appendChild(row);
      const callback = vi.fn();

      provider.onAdd(row, callback);

      // Trigger a mutation that IS an IMG addition
      const img = document.createElement('img');
      row.appendChild(img);

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(callback).not.toHaveBeenCalled();
          resolve();
        }, 0);
      });
    });
  });

  describe('transformFileName', () => {
    it('should pass through filename unchanged', () => {
      const row = document.createElement('div');
      const icon = document.createElement('span');
      expect(provider.transformFileName(row, icon, 'index.ts')).toBe(
        'index.ts'
      );
    });
  });
});
