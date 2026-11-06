import { beforeEach, describe, expect, it } from 'vitest';
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
      expect(provider.getIsDirectory({ row: document.body, icon })).toBe(false);
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
      expect(provider.getIsSubmodule({ row: document.body, icon })).toBe(false);
    });
  });

  describe('getIsSymlink', () => {
    it('should always return false', () => {
      const icon = document.createElement('span');
      expect(provider.getIsSymlink({ row: document.body, icon })).toBe(false);
    });
  });

  describe('row selector', () => {
    it.each(['Parent directory', 'Parent directory,', 'Parent directory, ..'])(
      'should include %s for folder icon replacement',
      (label) => {
        document.body.innerHTML = `
          <table data-qa="repository-directory"><tbody>
            <tr><td><a aria-label="${label}" href=".."><svg></svg><span>..</span></a></td></tr>
            <tr><td><a aria-label="Directory, src" href="src/"><svg></svg><span>src</span></a></td></tr>
            <tr><td><a aria-label="File, index.ts" href="index.ts"><svg></svg><span>index.ts</span></a></td></tr>
          </tbody></table>
        `;
        const rows = document.querySelectorAll(provider.selectors.row);
        expect(rows).toHaveLength(3);
        expect(
          Array.from(rows, (row) => row.getAttribute('aria-label'))
        ).toEqual([label, 'Directory, src', 'File, index.ts']);
        const row = rows[0] as HTMLElement;
        const icon = row.querySelector('svg') as unknown as HTMLElement;
        expect(provider.getIsDirectory({ row, icon })).toBe(true);
      }
    );
  });

  describe('pull request tree', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="file-tree">
          <button id="filter"><svg></svg>Filter files</button>
          <ul role="list">
            <li><a href="#chg-README.md">
              <div role="presentation"><span><span>Modified file</span><div><span aria-hidden="true"><svg></svg></span></div></span></div>
              <span role="presentation"><span><span>README.md</span></span></span>
              <div>+12 -9</div>
            </a></li>
            <li><button aria-expanded="true">
              <div><span role="img" aria-label="Directory"><svg></svg></span></div>
              <span role="presentation"><div><span><span>setups/src</span></span></div></span>
            </button><ul><li><a href="#chg-setups/src/main.c">
              <div><span aria-hidden="true"><svg></svg></span></div>
              <span role="presentation"><span>main.c</span></span><div>+52 -2</div>
            </a></li></ul></li>
          </ul>
        </div>
      `;
    });

    it('selects files and folder buttons, not toolbar controls or nested lists', () => {
      const rows = document.querySelectorAll(provider.selectors.row);
      expect(rows).toHaveLength(3);
      expect(Array.from(rows, (row) => row.tagName)).toEqual([
        'A',
        'BUTTON',
        'A',
      ]);
      expect(
        Array.from(rows, (row) => {
          const icon = row.querySelector(
            provider.selectors.icon
          ) as HTMLElement;
          return provider.transformFileName(
            row as HTMLElement,
            icon,
            'Modified file'
          );
        })
      ).toEqual(['README.md', 'src', 'main.c']);
    });

    it('keeps the chevron alongside the folder icon and does not duplicate it', () => {
      const row = document.querySelector(
        'button[aria-expanded]'
      ) as HTMLElement;
      const icon = row.querySelector(provider.selectors.icon) as HTMLElement;
      expect(provider.getIsDirectory({ row, icon })).toBe(true);
      expect(provider.getIsExpanded?.({ row, icon })).toBe(true);
      const replacement = document.createElement('img');
      replacement.setAttribute(
        'data-material-icons-extension-iconname',
        'folder-src-open.svg'
      );
      provider.replaceIcon(icon, replacement);
      expect(
        row.querySelectorAll('[data-material-icons-extension-chevron]')
      ).toHaveLength(1);
      expect(row.querySelector(provider.selectors.icon)).toBe(replacement);
      provider.replaceIcon(replacement, replacement.cloneNode() as HTMLElement);
      expect(
        row.querySelectorAll('[data-material-icons-extension-chevron]')
      ).toHaveLength(1);
    });

    it('refreshes the folder icon when expanded state changes', async () => {
      const row = document.querySelector(
        'button[aria-expanded]'
      ) as HTMLElement;
      let calls = 0;
      provider.onAdd(row, () => {
        calls++;
      });
      row.setAttribute('aria-expanded', 'false');
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(calls).toBe(1);
      const icon = row.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsExpanded?.({ row, icon })).toBe(false);
    });
  });

  describe('nested repository icons', () => {
    it.each([
      ['Directory, src', true, false],
      ['Directory, scripts', true, false],
      ['Submodule, dependency', false, true],
      ['File, README.md', false, false],
      ['File, src', false, false],
    ])(
      'should classify %s through nested icon wrappers',
      (label, isDirectory, isSubmodule) => {
        document.body.innerHTML = `
          <table data-qa="repository-directory"><tbody><tr><td>
            <a aria-label="${label}">
              <span><span><span><span aria-hidden="true">
                <svg role="presentation"></svg>
              </span></span></span><span>src</span></span>
            </a>
          </td></tr></tbody></table>
        `;
        const row = document.querySelector(
          provider.selectors.row
        ) as HTMLElement;
        const icon = row.querySelector('svg') as unknown as HTMLElement;
        expect(provider.getIsDirectory({ row, icon })).toBe(isDirectory);
        expect(provider.getIsSubmodule({ row, icon })).toBe(isSubmodule);

        // Classification must also survive replacement of the original SVG.
        const replacement = document.createElement('img');
        provider.replaceIcon(icon, replacement);
        expect(provider.getIsDirectory({ row, icon: replacement })).toBe(
          isDirectory
        );
        expect(provider.getIsSubmodule({ row, icon: replacement })).toBe(
          isSubmodule
        );
      }
    );
  });

  describe('replaceIcon', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it.each(['Directory, src', 'File, README.md'])(
      'should remove tile decoration only for directories (%s)',
      (label) => {
        document.body.innerHTML = `
          <a aria-label="${label}">
            <span class="tile" style="background: rgb(240, 240, 240); border-radius: 8px; width: 32px; height: 32px;">
              <span aria-hidden="true" style="width: ${label.startsWith('Directory,') ? 16 : 24}px; height: ${label.startsWith('Directory,') ? 16 : 24}px;"><svg style="width: 16px; height: 16px;"></svg></span>
            </span>
          </a>
        `;
        const tile = document.querySelector('.tile') as HTMLElement;
        const icon = document.querySelector('svg') as unknown as HTMLElement;
        const replacement = document.createElement('img');
        provider.replaceIcon(icon, replacement);

        if (label.startsWith('Directory,')) {
          expect(tile.style.background).toBe('transparent');
          expect(tile.style.boxShadow).toBe('none');
          expect(tile.style.borderRadius).toBe('0px');
        } else {
          expect(tile.style.background).toBe('rgb(240, 240, 240)');
          expect(tile.style.borderRadius).toBe('8px');
        }
        expect(replacement.style.width).toBe('20px');
        expect(replacement.style.height).toBe('20px');
        expect(replacement.parentElement?.style.width).toBe('20px');
        expect(replacement.parentElement?.style.height).toBe('20px');
        expect(tile.style.width).toBe('32px');
        expect(tile.style.height).toBe('32px');
      }
    );

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
      expect(newSVG.getAttribute('data-material-icons-extension')).toBeNull();
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
