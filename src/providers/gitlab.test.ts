import { beforeEach, describe, expect, it } from 'vitest';
import gitlab from './gitlab';

// left-to-right mark GitLab wraps truncation spans in, kept explicit instead of embedded raw
const LRM = '\u200E';

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

  describe('File Tree Browser markup', () => {
    it('should match a folder row via the row/filename/icon selectors', () => {
      document.body.innerHTML = `
        <a data-testid="file-row" aria-label=".github" class="file-row folder" href="/x/-/tree/main/.github">
          <span data-testid="file-row-name-container" data-qa-file-name=".github" class="file-row-name">
            <span class="gl-mr-2 gl-text-subtle">
              <svg data-testid="folder-icon" role="img" aria-hidden="true" class="folder-icon">
                <use href="#folder"></use>
              </svg>
            </span>
            <span class="gl-truncate-component">
              <span class="gl-truncate-end">.gi</span><span class="gl-truncate-start">${LRM}thub${LRM}</span>
            </span>
          </span>
        </a>
      `;

      const row = document.querySelector(provider.selectors.row);
      expect(row).not.toBeNull();

      const filenameEl = row?.querySelector(provider.selectors.filename);
      expect(filenameEl).not.toBeNull();
      expect(filenameEl?.getAttribute('data-qa-file-name')).toBe('.github');

      const iconEl = row?.querySelector(provider.selectors.icon) as HTMLElement;
      expect(iconEl).not.toBeNull();
      expect(
        provider.getIsDirectory({ row: row as HTMLElement, icon: iconEl })
      ).toBe(true);
    });

    it('should not pick up the toggle-button chevron icon for a folder row inside the tree container', () => {
      document.body.innerHTML = `
        <li role="treeitem" aria-label=".github">
          <div data-testid="file-row-container">
            <button data-testid="tree-toggle-button" type="button">
              <svg data-testid="chevron-right-icon"><use href="#chevron-right"></use></svg>
            </button>
            <a href="/x/-/tree/main/.github" data-testid="file-row" aria-label=".github" class="file-row folder">
              <span title=".github" data-qa-file-name=".github" data-testid="file-row-name-container" class="file-row-name">
                <span class="gl-mr-2 gl-text-subtle">
                  <svg data-testid="folder-icon" class="folder-icon"><use href="#folder"></use></svg>
                </span>
                <span class="gl-truncate-component"><span class="gl-truncate-end">.gi</span><span class="gl-truncate-start">${LRM}thub${LRM}</span></span>
              </span>
            </a>
          </div>
        </li>
      `;

      const row = document.querySelector(provider.selectors.row) as HTMLElement;
      expect(row.getAttribute('data-testid')).toBe('file-row');

      const iconEl = row.querySelector(provider.selectors.icon);
      expect(iconEl?.getAttribute('data-testid')).toBe('folder-icon');
    });

    it('should resolve a plain file row whose icon has no data-testid', () => {
      document.body.innerHTML = `
        <a href="/x/-/blob/main/.gitignore" data-testid="file-row" aria-label=".gitignore" class="file-row">
          <span title=".gitignore" data-qa-file-name=".gitignore" data-testid="file-row-name-container" class="file-row-name">
            <span class="gl-mr-2">
              <svg class="s16"><use href="#git"></use></svg>
            </span>
            <span class="gl-truncate-component"><span class="gl-truncate-end">.giti</span><span class="gl-truncate-start">${LRM}gnore${LRM}</span></span>
          </span>
        </a>
      `;

      const row = document.querySelector(provider.selectors.row) as HTMLElement;
      const filenameEl = row.querySelector(provider.selectors.filename);
      expect(filenameEl?.getAttribute('data-qa-file-name')).toBe('.gitignore');

      const iconEl = row.querySelector(provider.selectors.icon) as HTMLElement;
      expect(iconEl).not.toBeNull();
      expect(provider.getIsDirectory({ row, icon: iconEl })).toBe(false);
    });
  });

  describe('"Find file" search dropdown markup', () => {
    it('should match a plain file result via the row/filename/icon selectors', () => {
      document.body.innerHTML = `
        <li tabindex="0" data-testid="disclosure-dropdown-item" class="gl-new-dropdown-item">
          <a href="/x/-/blob/dev/index.ts" tabindex="-1" data-track-action="click_command_palette_item" data-track-label="file" class="gl-new-dropdown-item-content">
            <span class="gl-new-dropdown-item-text-wrapper">
              <div class="gl-flex gl-items-center">
                <svg data-testid="icon" role="img" aria-hidden="true" class="gl-mr-3 gl-shrink-0 gl-icon s16 gl-fill-current">
                  <use href="#doc-code"></use>
                </svg>
                <span class="gl-flex gl-min-w-0 gl-items-center gl-gap-2">
                  <span class="gl-truncate">
                    <span data-testid="unhighlighted-segment">index.ts</span>
                  </span>
                </span>
              </div>
            </span>
          </a>
        </li>
      `;

      const row = document.querySelector(provider.selectors.row) as HTMLElement;
      expect(row.getAttribute('data-track-label')).toBe('file');

      const filenameEl = row.querySelector(provider.selectors.filename);
      expect(filenameEl?.textContent?.trim()).toBe('index.ts');

      const iconEl = row.querySelector(provider.selectors.icon) as HTMLElement;
      expect(iconEl?.getAttribute('data-testid')).toBe('icon');
      expect(provider.getIsDirectory({ row, icon: iconEl })).toBe(false);
    });

    it('should expose the full nested path for a result under a subdirectory, letting the generic last-segment split resolve the base filename', () => {
      document.body.innerHTML = `
        <li tabindex="0" data-testid="disclosure-dropdown-item" class="gl-new-dropdown-item">
          <a href="/x/-/blob/dev/src/lib/index.ts" tabindex="-1" data-track-action="click_command_palette_item" data-track-label="file" class="gl-new-dropdown-item-content">
            <span class="gl-new-dropdown-item-text-wrapper">
              <div class="gl-flex gl-items-center">
                <svg data-testid="icon"><use href="#doc-code"></use></svg>
                <span class="gl-flex gl-min-w-0 gl-items-center gl-gap-2">
                  <span class="gl-truncate">
                    <span data-testid="unhighlighted-segment">src/lib/index.ts</span>
                  </span>
                </span>
              </div>
            </span>
          </a>
        </li>
      `;

      const row = document.querySelector(provider.selectors.row) as HTMLElement;
      const filenameEl = row.querySelector(provider.selectors.filename);
      // no truncation-span splitting on this markup, so raw textContent is already clean
      expect(filenameEl?.textContent?.trim()).toBe('src/lib/index.ts');
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
      expect(provider.getIsDirectory({ row: document.body, icon })).toBe(false);
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

      expect(newSVG.getAttribute('data-material-icons-extension')).toBeNull();
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

    it('should use the clean data-qa-file-name attribute for File Tree Browser rows, ignoring the truncated textContent-derived name', () => {
      document.body.innerHTML = `
        <a data-testid="file-row" aria-label=".github" class="file-row folder">
          <span data-testid="file-row-name-container" data-qa-file-name=".github" class="file-row-name">
            <span class="gl-truncate-component"><span class="gl-truncate-end">.gi</span><span class="gl-truncate-start">${LRM}thub${LRM}</span></span>
          </span>
        </a>
      `;
      const row = document.querySelector(
        '[data-testid="file-row"]'
      ) as HTMLElement;
      const icon = document.createElement('svg') as unknown as HTMLElement;

      // simulates the garbled name replace-icon.ts would have extracted via textContent
      expect(provider.transformFileName(row, icon, `.gi${LRM}thub${LRM}`)).toBe(
        '.github'
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
      expect(provider.transformFileName(li, icon, 'Source code (zip)')).toBe(
        'Source code.zip'
      );
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
      expect(provider.transformFileName(li, icon, 'Source code (tar.gz)')).toBe(
        'Source code.tar.gz'
      );
    });
  });
});
