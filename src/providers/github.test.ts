import { describe, it, expect, beforeEach } from 'vitest';
import github from './github';

describe('GitHub provider', () => {
  const provider = github();

  describe('replaceIcon', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('should set background-image on the original SVG', () => {
      document.body.innerHTML = `
        <svg class="octicon octicon-file" viewBox="0 0 16 16" width="16" height="16">
          <path d="M2 1.75C2..."></path>
        </svg>
      `;
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newIcon = document.createElement('img');
      newIcon.setAttribute('src', 'chrome-extension://id/typescript.svg');
      newIcon.setAttribute('data-material-icons-extension', 'icon');
      newIcon.setAttribute(
        'data-material-icons-extension-iconname',
        'typescript.svg'
      );
      newIcon.setAttribute(
        'data-material-icons-extension-filename',
        'index.ts'
      );

      provider.replaceIcon(svgEl, newIcon);

      expect(svgEl.style.backgroundImage).toBe(
        'url("chrome-extension://id/typescript.svg")'
      );
      expect(svgEl.style.backgroundSize).toBe('contain');
      expect(svgEl.style.backgroundRepeat).toBe('no-repeat');
      expect(svgEl.style.backgroundPosition).toBe('center center');
    });

    it('should clear SVG inner content (paths)', () => {
      document.body.innerHTML = `
        <svg class="octicon octicon-file" viewBox="0 0 16 16">
          <path d="M2 1.75C2..."></path>
          <path d="M5 3..."></path>
        </svg>
      `;
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newIcon = document.createElement('img');
      newIcon.setAttribute('src', 'chrome-extension://id/typescript.svg');
      newIcon.setAttribute('data-material-icons-extension', 'icon');
      newIcon.setAttribute(
        'data-material-icons-extension-iconname',
        'typescript.svg'
      );
      newIcon.setAttribute(
        'data-material-icons-extension-filename',
        'index.ts'
      );

      provider.replaceIcon(svgEl, newIcon);

      expect(svgEl.innerHTML).toBe('');
    });

    it('should mark the SVG with extension data attributes', () => {
      document.body.innerHTML = `
        <svg class="octicon octicon-file" viewBox="0 0 16 16">
          <path d="M2 1.75C2..."></path>
        </svg>
      `;
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newIcon = document.createElement('img');
      newIcon.setAttribute('src', 'chrome-extension://id/folder-src.svg');
      newIcon.setAttribute('data-material-icons-extension', 'icon');
      newIcon.setAttribute(
        'data-material-icons-extension-iconname',
        'folder-src.svg'
      );
      newIcon.setAttribute('data-material-icons-extension-filename', 'src');

      provider.replaceIcon(svgEl, newIcon);

      expect(svgEl.getAttribute('data-material-icons-extension')).toBe('icon');
      expect(
        svgEl.getAttribute('data-material-icons-extension-iconname')
      ).toBe('folder-src.svg');
      expect(
        svgEl.getAttribute('data-material-icons-extension-filename')
      ).toBe('src');
    });

    it('should reset display style (in case it was previously hidden)', () => {
      document.body.innerHTML = `
        <svg class="octicon octicon-file" style="display: none;">
          <path d="M2 1.75C2..."></path>
        </svg>
      `;
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newIcon = document.createElement('img');
      newIcon.setAttribute('src', 'chrome-extension://id/typescript.svg');
      newIcon.setAttribute('data-material-icons-extension', 'icon');
      newIcon.setAttribute(
        'data-material-icons-extension-iconname',
        'typescript.svg'
      );
      newIcon.setAttribute(
        'data-material-icons-extension-filename',
        'index.ts'
      );

      provider.replaceIcon(svgEl, newIcon);

      expect(svgEl.style.display).toBe('');
    });

    it('should update background when called again on same element', () => {
      document.body.innerHTML = `
        <svg class="octicon octicon-file" viewBox="0 0 16 16">
          <path d="M2 1.75C2..."></path>
        </svg>
      `;
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;

      // First call
      const newIcon1 = document.createElement('img');
      newIcon1.setAttribute('src', 'chrome-extension://id/folder-src.svg');
      newIcon1.setAttribute('data-material-icons-extension', 'icon');
      newIcon1.setAttribute(
        'data-material-icons-extension-iconname',
        'folder-src.svg'
      );
      newIcon1.setAttribute('data-material-icons-extension-filename', 'src');
      provider.replaceIcon(svgEl, newIcon1);

      // Second call (simulating expand)
      const newIcon2 = document.createElement('img');
      newIcon2.setAttribute(
        'src',
        'chrome-extension://id/folder-src-open.svg'
      );
      newIcon2.setAttribute('data-material-icons-extension', 'icon');
      newIcon2.setAttribute(
        'data-material-icons-extension-iconname',
        'folder-src-open.svg'
      );
      newIcon2.setAttribute('data-material-icons-extension-filename', 'src');
      provider.replaceIcon(svgEl, newIcon2);

      expect(svgEl.style.backgroundImage).toBe(
        'url("chrome-extension://id/folder-src-open.svg")'
      );
      expect(
        svgEl.getAttribute('data-material-icons-extension-iconname')
      ).toBe('folder-src-open.svg');
    });

    it('should copy fgColor class to adjacent link', () => {
      document.body.innerHTML = `
        <div>
          <span>
            <svg class="octicon octicon-file-added fgColor-done" viewBox="0 0 16 16">
              <path d="M2..."></path>
            </svg>
          </span>
          <span><a href="#">file.ts</a></span>
        </div>
      `;
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newIcon = document.createElement('img');
      newIcon.setAttribute('src', 'chrome-extension://id/typescript.svg');
      newIcon.setAttribute('data-material-icons-extension', 'icon');
      newIcon.setAttribute(
        'data-material-icons-extension-iconname',
        'typescript.svg'
      );
      newIcon.setAttribute(
        'data-material-icons-extension-filename',
        'file.ts'
      );

      provider.replaceIcon(svgEl, newIcon);

      const link = document.querySelector('a') as HTMLElement;
      expect(link.classList.contains('fgColor-done')).toBe(true);
    });

    it('should not copy fgColor-muted class to adjacent link', () => {
      document.body.innerHTML = `
        <div>
          <span>
            <svg class="octicon octicon-file fgColor-muted" viewBox="0 0 16 16">
              <path d="M2..."></path>
            </svg>
          </span>
          <span><a href="#">file.ts</a></span>
        </div>
      `;
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newIcon = document.createElement('img');
      newIcon.setAttribute('src', 'chrome-extension://id/typescript.svg');
      newIcon.setAttribute('data-material-icons-extension', 'icon');
      newIcon.setAttribute(
        'data-material-icons-extension-iconname',
        'typescript.svg'
      );
      newIcon.setAttribute(
        'data-material-icons-extension-filename',
        'file.ts'
      );

      provider.replaceIcon(svgEl, newIcon);

      const link = document.querySelector('a') as HTMLElement;
      expect(link.classList.contains('fgColor-muted')).toBe(false);
    });

    it('should not add elements to the DOM (background approach only)', () => {
      document.body.innerHTML = `
        <div class="container">
          <svg class="octicon octicon-file" viewBox="0 0 16 16">
            <path d="M2 1.75C2..."></path>
          </svg>
        </div>
      `;
      const container = document.querySelector('.container') as HTMLElement;
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newIcon = document.createElement('img');
      newIcon.setAttribute('src', 'chrome-extension://id/typescript.svg');
      newIcon.setAttribute('data-material-icons-extension', 'icon');
      newIcon.setAttribute(
        'data-material-icons-extension-iconname',
        'typescript.svg'
      );
      newIcon.setAttribute(
        'data-material-icons-extension-filename',
        'index.ts'
      );

      provider.replaceIcon(svgEl, newIcon);

      // Should only have the original SVG, no img element added
      expect(container.querySelectorAll('img').length).toBe(0);
      expect(container.querySelectorAll('svg').length).toBe(1);
    });
  });

  describe('getIsDirectory', () => {
    it('should detect directory from aria-label', () => {
      document.body.innerHTML =
        '<svg aria-label="Directory" class="octicon"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(
        provider.getIsDirectory({ row: document.body, icon })
      ).toBe(true);
    });

    it('should detect directory from octicon-file-directory-fill class', () => {
      document.body.innerHTML =
        '<svg class="octicon octicon-file-directory-fill"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(
        provider.getIsDirectory({ row: document.body, icon })
      ).toBe(true);
    });

    it('should detect directory from octicon-file-directory-open-fill class', () => {
      document.body.innerHTML =
        '<svg class="octicon octicon-file-directory-open-fill"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(
        provider.getIsDirectory({ row: document.body, icon })
      ).toBe(true);
    });

    it('should return false for file icons', () => {
      document.body.innerHTML = '<svg class="octicon octicon-file"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(
        provider.getIsDirectory({ row: document.body, icon })
      ).toBe(false);
    });
  });

  describe('getIsExpanded', () => {
    it('should return true for open directory icon', () => {
      document.body.innerHTML =
        '<svg class="octicon octicon-file-directory-open-fill"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(
        provider.getIsExpanded!({ row: document.body, icon })
      ).toBe(true);
    });

    it('should return false for closed directory icon', () => {
      document.body.innerHTML =
        '<svg class="octicon octicon-file-directory-fill"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(
        provider.getIsExpanded!({ row: document.body, icon })
      ).toBe(false);
    });
  });

  describe('getIsSubmodule', () => {
    it('should detect submodule from class', () => {
      document.body.innerHTML =
        '<svg class="octicon octicon-file-submodule"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(
        provider.getIsSubmodule({ row: document.body, icon })
      ).toBe(true);
    });
  });

  describe('transformFileName', () => {
    it('should strip submodule SHA from filename', () => {
      const row = document.createElement('div');
      const icon = document.createElement('svg');
      expect(
        provider.transformFileName(row, icon, 'my-module @ abc1234')
      ).toBe('my-module');
    });

    it('should transform Source code archive names', () => {
      const row = document.createElement('div');
      row.classList.add('Box-row');
      const icon = document.createElement('svg');
      expect(
        provider.transformFileName(row, icon, 'Source code (zip)')
      ).toBe('Source code.zip');
    });

    it('should pass through normal filenames', () => {
      const row = document.createElement('div');
      const icon = document.createElement('svg');
      expect(provider.transformFileName(row, icon, 'index.ts')).toBe(
        'index.ts'
      );
    });
  });
});
