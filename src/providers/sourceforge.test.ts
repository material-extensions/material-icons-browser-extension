import { describe, it, expect, beforeEach } from 'vitest';
import sourceforge from './sourceforge';

describe('SourceForge provider', () => {
  const provider = sourceforge();

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('basic properties', () => {
    it('should have name "sourceforge"', () => {
      expect(provider.name).toBe('sourceforge');
    });

    it('should have domain host "sourceforge.net"', () => {
      expect(provider.domains[0].host).toBe('sourceforge.net');
    });

    it('should match "sourceforge.net" with the regex', () => {
      expect(provider.domains[0].test.test('sourceforge.net')).toBe(true);
    });

    it('should not match other domains', () => {
      expect(provider.domains[0].test.test('notsourceforge.net')).toBe(false);
      expect(provider.domains[0].test.test('sourceforge.net.evil.com')).toBe(
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
    it('should always return true (no dark theme available)', () => {
      expect(provider.getIsLightTheme()).toBe(true);
    });
  });

  describe('getIsDirectory', () => {
    it('should return true when icon is an I element with "fa-folder" class', () => {
      document.body.innerHTML =
        '<tr><td><i class="fa fa-folder"></i></td></tr>';
      const row = document.querySelector('tr') as HTMLElement;
      const icon = document.querySelector('i') as HTMLElement;
      expect(provider.getIsDirectory({ row, icon })).toBe(true);
    });

    it('should return false when icon is an I element without "fa-folder" class', () => {
      document.body.innerHTML =
        '<tr><td><i class="fa fa-file"></i></td></tr>';
      const row = document.querySelector('tr') as HTMLElement;
      const icon = document.querySelector('i') as HTMLElement;
      expect(provider.getIsDirectory({ row, icon })).toBe(false);
    });

    it('should return true when icon is not an I element and row has "folder" class', () => {
      document.body.innerHTML =
        '<table><tbody><tr class="folder"><th><a href="#">Folder</a></th></tr></tbody></table>';
      const row = document.querySelector('tr') as HTMLElement;
      const icon = document.querySelector('a') as HTMLElement;
      expect(provider.getIsDirectory({ row, icon })).toBe(true);
    });

    it('should return false when icon is not an I element and row does not have "folder" class', () => {
      document.body.innerHTML =
        '<table><tbody><tr class="file"><th><a href="#">File.txt</a></th></tr></tbody></table>';
      const row = document.querySelector('tr') as HTMLElement;
      const icon = document.querySelector('a') as HTMLElement;
      expect(provider.getIsDirectory({ row, icon })).toBe(false);
    });
  });

  describe('getIsSubmodule', () => {
    it('should always return false', () => {
      const row = document.createElement('tr');
      const icon = document.createElement('i');
      expect(provider.getIsSubmodule({ row, icon })).toBe(false);
    });
  });

  describe('getIsSymlink', () => {
    it('should return true when icon is an I element with "fa-star" class', () => {
      document.body.innerHTML = '<tr><td><i class="fa fa-star"></i></td></tr>';
      const row = document.querySelector('tr') as HTMLElement;
      const icon = document.querySelector('i') as HTMLElement;
      expect(provider.getIsSymlink({ row, icon })).toBe(true);
    });

    it('should return false when icon is an I element without "fa-star" class', () => {
      document.body.innerHTML = '<tr><td><i class="fa fa-file"></i></td></tr>';
      const row = document.querySelector('tr') as HTMLElement;
      const icon = document.querySelector('i') as HTMLElement;
      expect(provider.getIsSymlink({ row, icon })).toBe(false);
    });

    it('should return false when icon is not an I element', () => {
      document.body.innerHTML =
        '<tr><th><a href="#" class="fa-star">Link</a></th></tr>';
      const row = document.querySelector('tr') as HTMLElement;
      const icon = document.querySelector('a') as HTMLElement;
      expect(provider.getIsSymlink({ row, icon })).toBe(false);
    });
  });

  describe('replaceIcon', () => {
    describe('when icon is an I element', () => {
      it('should set verticalAlign to text-bottom', () => {
        document.body.innerHTML =
          '<div><a class="icon"><i class="fa fa-file"></i></a></div>';
        const icon = document.querySelector('i') as HTMLElement;
        const newSVG = document.createElement('img') as unknown as HTMLElement;

        provider.replaceIcon(icon, newSVG);

        expect(newSVG.style.verticalAlign).toBe('text-bottom');
      });

      it('should set height to 14px and width to 14px', () => {
        document.body.innerHTML =
          '<div><a class="icon"><i class="fa fa-file"></i></a></div>';
        const icon = document.querySelector('i') as HTMLElement;
        const newSVG = document.createElement('img') as unknown as HTMLElement;

        provider.replaceIcon(icon, newSVG);

        expect(newSVG.style.height).toBe('14px');
        expect(newSVG.style.width).toBe('14px');
      });

      it('should replace the I element in the DOM', () => {
        document.body.innerHTML =
          '<div><a class="icon"><i class="fa fa-file"></i></a></div>';
        const anchor = document.querySelector('a') as HTMLElement;
        const icon = document.querySelector('i') as HTMLElement;
        const newSVG = document.createElement('img') as unknown as HTMLElement;

        provider.replaceIcon(icon, newSVG);

        expect(anchor.contains(icon)).toBe(false);
        expect(anchor.contains(newSVG)).toBe(true);
      });
    });

    describe('when icon is an A (anchor) element', () => {
      it('should set verticalAlign to text-bottom', () => {
        document.body.innerHTML =
          '<th><a href="#"><svg><path d="M1"></path></svg> File.txt</a></th>';
        const anchor = document.querySelector('a') as HTMLElement;
        const newSVG = document.createElement('img') as unknown as HTMLElement;

        provider.replaceIcon(anchor, newSVG);

        expect(newSVG.style.verticalAlign).toBe('text-bottom');
      });

      it('should set height to 20px and width to 20px', () => {
        document.body.innerHTML =
          '<th><a href="#"><svg><path d="M1"></path></svg> File.txt</a></th>';
        const anchor = document.querySelector('a') as HTMLElement;
        const newSVG = document.createElement('img') as unknown as HTMLElement;

        provider.replaceIcon(anchor, newSVG);

        expect(newSVG.style.height).toBe('20px');
        expect(newSVG.style.width).toBe('20px');
      });

      it('should replace the SVG inside the anchor element', () => {
        document.body.innerHTML =
          '<th><a href="#"><svg><path d="M1"></path></svg> File.txt</a></th>';
        const anchor = document.querySelector('a') as HTMLElement;
        const svgInside = document.querySelector('svg') as Element;
        const newSVG = document.createElement('img') as unknown as HTMLElement;

        provider.replaceIcon(anchor, newSVG);

        expect(anchor.contains(svgInside)).toBe(false);
        expect(anchor.contains(newSVG)).toBe(true);
      });

      it('should prepend the new icon if no SVG exists inside anchor', () => {
        document.body.innerHTML =
          '<th><a href="#">File.txt</a></th>';
        const anchor = document.querySelector('a') as HTMLElement;
        const newSVG = document.createElement('img') as unknown as HTMLElement;

        provider.replaceIcon(anchor, newSVG);

        expect(anchor.firstChild).toBe(newSVG);
      });

      it('should not replace/prepend if already has material-icons-extension icon', () => {
        document.body.innerHTML =
          '<th><a href="#"><img data-material-icons-extension="icon" /> File.txt</a></th>';
        const anchor = document.querySelector('a') as HTMLElement;
        const newSVG = document.createElement('img') as unknown as HTMLElement;

        provider.replaceIcon(anchor, newSVG);

        // Should still only have the one img
        expect(anchor.querySelectorAll('img').length).toBe(1);
        // The new SVG should NOT be in the DOM
        expect(anchor.contains(newSVG)).toBe(false);
      });
    });
  });

  describe('onAdd', () => {
    it('should be a no-op function', () => {
      const row = document.createElement('tr');
      const callback = () => {};
      expect(() => provider.onAdd(row, callback)).not.toThrow();
    });
  });

  describe('transformFileName', () => {
    it('should pass through filename unchanged', () => {
      const row = document.createElement('tr');
      const icon = document.createElement('i');
      expect(provider.transformFileName(row, icon, 'readme.txt')).toBe(
        'readme.txt'
      );
    });
  });
});
