import { generateManifest } from 'material-icon-theme';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { replaceIconInRow } from '../lib/replace-icon';
import { replaceAllIcons } from '../lib/replace-icons';
import cnb from './cnb';

vi.mock('webextension-polyfill', () => ({
  default: {
    runtime: {
      getURL: (name: string) => `chrome-extension://test-id/${name}`,
    },
  },
}));

// Generated during the build, but CI runs tests before building.
vi.mock('../icon-list.json', () => ({
  default: {
    file: 'file.svg',
    folder: 'folder.svg',
    'folder-open': 'folder-open.svg',
    'folder-src': 'folder-src.svg',
    'folder-src-open': 'folder-src-open.svg',
    rust: 'rust.svg',
    nodejs: 'nodejs.svg',
  },
}));

describe('CNB provider', () => {
  const provider = cnb();

  beforeEach(() => {
    document.body.innerHTML = '';
    document.documentElement.classList.remove('dark');
  });

  describe('basic properties', () => {
    it('should have name "cnb"', () => {
      expect(provider.name).toBe('cnb');
    });

    it('should have domain host "cnb.cool"', () => {
      expect(provider.domains[0].host).toBe('cnb.cool');
    });

    it('should match "cnb.cool" with the regex', () => {
      expect(provider.domains[0].test.test('cnb.cool')).toBe(true);
    });

    it('should not match other domains', () => {
      expect(provider.domains[0].test.test('notcnb.cool')).toBe(false);
      expect(provider.domains[0].test.test('cnb.cool.evil.com')).toBe(false);
    });

    it('should not be able to self host', () => {
      expect(provider.canSelfHost).toBe(false);
    });

    it('should not be custom', () => {
      expect(provider.isCustom).toBe(false);
    });
  });

  describe('getIsLightTheme', () => {
    it('should return true when <html> has no "dark" class', () => {
      document.documentElement.classList.remove('dark');
      expect(provider.getIsLightTheme()).toBe(true);
    });

    it('should return false when <html> has the "dark" class', () => {
      document.documentElement.classList.add('dark');
      expect(provider.getIsLightTheme()).toBe(false);
    });
  });

  describe('getIsDirectory', () => {
    it('should return true when icon has "ruyi-icon-folder" class', () => {
      document.body.innerHTML =
        '<svg class="ruyi-icon ruyi-icon-folder-colorful-colored"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsDirectory({ row: document.body, icon })).toBe(true);
    });

    it('should return false when icon does not have "ruyi-icon-folder" class', () => {
      document.body.innerHTML = '<svg class="ruyi-icon ruyi-icon-file"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsDirectory({ row: document.body, icon })).toBe(false);
    });
  });

  describe('getIsSubmodule', () => {
    it('should always return false', () => {
      document.body.innerHTML =
        '<svg class="ruyi-icon ruyi-icon-folder-colorful-colored"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsSubmodule({ row: document.body, icon })).toBe(false);
    });
  });

  describe('getIsSymlink', () => {
    it('should always return false', () => {
      document.body.innerHTML = '<svg class="ruyi-icon ruyi-icon-file"></svg>';
      const icon = document.querySelector('svg') as unknown as HTMLElement;
      expect(provider.getIsSymlink({ row: document.body, icon })).toBe(false);
    });
  });

  describe('replaceIcon', () => {
    it('should copy attributes from old element to new element', () => {
      document.body.innerHTML =
        '<div><svg class="ruyi-icon ruyi-icon-file" data-custom="value"></svg></div>';
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('img') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.getAttribute('class')).toBe('ruyi-icon ruyi-icon-file');
      expect(newSVG.getAttribute('data-custom')).toBe('value');
    });

    it('should NOT copy "src" attribute', () => {
      document.body.innerHTML = '<div><svg src="old.svg"></svg></div>';
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('img') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.getAttribute('src')).toBeNull();
    });

    it('should NOT copy "id" attribute', () => {
      document.body.innerHTML =
        '<div><svg id="folder-colorful-colored" class="ruyi-icon"></svg></div>';
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('img') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.getAttribute('id')).toBeNull();
    });

    it('should NOT copy "data-material-icons-extension-*" attributes', () => {
      document.body.innerHTML =
        '<div><svg data-material-icons-extension="icon" data-material-icons-extension-iconname="test.svg"></svg></div>';
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('img') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.getAttribute('data-material-icons-extension')).toBeNull();
      expect(
        newSVG.getAttribute('data-material-icons-extension-iconname')
      ).toBeNull();
    });

    it('should set height to 16px and width to 16px', () => {
      document.body.innerHTML = '<div><svg class="ruyi-icon"></svg></div>';
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
      const newSVG = document.createElement('img') as unknown as HTMLElement;

      provider.replaceIcon(svgEl, newSVG);

      expect(newSVG.style.height).toBe('16px');
      expect(newSVG.style.width).toBe('16px');
    });

    it('should replace the old element in the DOM via parentNode.replaceChild', () => {
      document.body.innerHTML =
        '<div class="container"><svg class="ruyi-icon ruyi-icon-file"></svg></div>';
      const container = document.querySelector('.container') as HTMLElement;
      const svgEl = document.querySelector('svg') as unknown as HTMLElement;
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
    it('should pass through filenames unchanged', () => {
      const row = document.createElement('div');
      const icon = document.createElement('i');
      expect(provider.transformFileName(row, icon, 'index.ts')).toBe(
        'index.ts'
      );
      expect(
        provider.transformFileName(row, icon, 'DBX_0.5.77_x64-portable.zip')
      ).toBe('DBX_0.5.77_x64-portable.zip');
    });

    it('should transform "Source code（zip）" to "Source code.zip"', () => {
      const row = document.createElement('div');
      const icon = document.createElement('i');
      expect(provider.transformFileName(row, icon, 'Source code（zip）')).toBe(
        'Source code.zip'
      );
    });

    it('should transform "Source code（tar.gz）" to "Source code.tar.gz"', () => {
      const row = document.createElement('div');
      const icon = document.createElement('i');
      expect(
        provider.transformFileName(row, icon, 'Source code（tar.gz）')
      ).toBe('Source code.tar.gz');
    });

    it('should also transform half-width "Source code (zip)"', () => {
      const row = document.createElement('div');
      const icon = document.createElement('i');
      expect(provider.transformFileName(row, icon, 'Source code (zip)')).toBe(
        'Source code.zip'
      );
    });
  });

  describe('selectors', () => {
    it('should select file list table rows', () => {
      document.body.innerHTML = `
        <table class="cnb-file-table">
          <tbody>
            <tr><td></td></tr>
            <tr><td></td></tr>
          </tbody>
        </table>`;
      expect(document.querySelectorAll(provider.selectors.row).length).toBe(2);
    });

    it('should select release asset rows', () => {
      document.body.innerHTML = `
        <div class="w-full" id="asset">
          <div class="overflow-x-auto">
            <div class="w-full relative flex"></div>
            <div class="w-full relative flex"></div>
          </div>
        </div>`;
      expect(document.querySelectorAll(provider.selectors.row).length).toBe(2);
    });

    it('should select the filename span in the file list', () => {
      document.body.innerHTML =
        '<div><span class="ml-2 truncate">index.ts</span></div>';
      expect(
        document.querySelector(provider.selectors.filename)?.textContent
      ).toBe('index.ts');
    });

    it('should select the download link in release rows', () => {
      document.body.innerHTML =
        '<div><a href="/releases/download/v0.5.77/latest.json" download="">latest.json</a></div>';
      expect(
        document.querySelector(provider.selectors.filename)?.textContent
      ).toBe('latest.json');
    });

    it('should select the ruyi icon svg', () => {
      document.body.innerHTML =
        '<div><svg class="ruyi-icon ruyi-icon-file"></svg></div>';
      expect(
        document
          .querySelector(provider.selectors.icon)
          ?.classList.contains('ruyi-icon')
      ).toBe(true);
    });
  });
});
const manifest = generateManifest();
const iconSelector = '[data-cnb-tree-icon]';

// Representative CNB commit tree, including its CSS-module names and diff counts.
const tree = `
  <div class="font-primary" style="position: relative; overflow: auto; height: 677px;">
    <div style="height: 110px; width: 100%;">
      <div class="directory_tree-item__4gUzH flex items-center" style="position: absolute; top: 0px; height: 22px; --level: 0;">
        <span class="directory_tree-item__line__Swnan tree-item__first"></span>
        <div class="flex items-center truncate">
          <svg id="chevron-down" class="ruyi-icon cursor-pointer ruyi-icon-chevron-down"></svg>
          <span class="flex-1 inline-block w-full pr-2 text-sm truncate">src</span>
        </div>
      </div>
      <a class="directory_tree-item__4gUzH JS-tree-item flex items-center" href="/dbxio.com/dbx/-/commit/239183#diff-125" data-diff-id="diff-125" style="position: absolute; top: 22px; height: 22px; --level: 1;">
        <span class="directory_tree-item__line__Swnan tree-item__last"></span>
        <div class="pr-2 JS-tree-item_content w-full flex justify-between">
          <span class="text-sm truncate">ssh_proxy_command.rs</span>
          <div class="inline-flex gap-1 text-xs"><span class="text-success-400">+11</span><span class="text-brand-500">-2</span></div>
        </div>
      </a>
    </div>
  </div>`;

describe('CNB commit directory tree', () => {
  const provider = cnb();
  const replace = (row: HTMLElement) =>
    replaceIconInRow(row, provider, manifest);
  const getRows = () =>
    Array.from(document.querySelectorAll<HTMLElement>(provider.selectors.row));

  beforeEach(() => {
    document.body.innerHTML = tree;
    document.documentElement.classList.remove('dark');
  });

  it('selects rows and filenames without selecting indentation guides or diff counts', () => {
    const rows = getRows();
    expect(rows).toHaveLength(2);
    expect(
      rows.map(
        (row) => row.querySelector(provider.selectors.filename)?.textContent
      )
    ).toEqual(['src', 'ssh_proxy_command.rs']);
  });

  it('inserts folder and Rust icons while preserving labels, links, counts and chevron handlers', () => {
    const [folder, file] = getRows();
    const chevron = folder.querySelector('svg')!;
    const onClick = vi.fn();
    chevron.addEventListener('click', onClick);
    const label = file.querySelector('span.truncate');
    getRows().forEach(replace);

    expect(
      folder
        .querySelector(iconSelector)
        ?.getAttribute('data-material-icons-extension-iconname')
    ).toBe('folder-src-open.svg');
    expect(
      file
        .querySelector(iconSelector)
        ?.getAttribute('data-material-icons-extension-iconname')
    ).toBe('rust.svg');
    expect(file.querySelector('span.truncate')).toBe(label);
    expect(file.getAttribute('href')).toContain('#diff-125');
    expect(file.querySelector('.text-success-400')?.textContent).toBe('+11');
    expect(file.querySelector('.text-brand-500')?.textContent).toBe('-2');
    expect(folder.querySelector('svg')).toBe(chevron);
    chevron.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not duplicate inserted icons, including when appearance settings change', () => {
    getRows().forEach(replace);
    getRows().forEach(replace);
    replaceAllIcons(provider, { folderTheme: 'classic' });
    getRows().forEach(replace);
    expect(document.querySelectorAll(iconSelector)).toHaveLength(2);
    expect(
      getRows()[0]
        .querySelector(iconSelector)
        ?.getAttribute('data-material-icons-extension-iconname')
    ).toBe('folder-open.svg');
  });

  it('supports different CSS-module hashes and collapsed folders', () => {
    const folder = getRows()[0];
    folder.className = 'flex directory_tree-item__NewHash';
    folder
      .querySelector('svg')!
      .setAttribute('class', 'ruyi-icon ruyi-icon-chevron-right');
    expect(getRows()).toHaveLength(2);
    replace(folder);
    expect(
      folder
        .querySelector(iconSelector)
        ?.getAttribute('data-material-icons-extension-iconname')
    ).toBe('folder-src.svg');
  });

  it('refreshes icons when virtualized rows change filenames or expansion state', async () => {
    const [folder, file] = getRows();
    for (const row of getRows()) {
      replace(row);
      provider.onAdd(row, () => replace(row));
    }
    // React can update a text node in place rather than inserting a new element.
    file.querySelector('span.truncate')!.firstChild!.textContent =
      'package.json';
    folder
      .querySelector('svg')!
      .setAttribute('class', 'ruyi-icon ruyi-icon-chevron-right');
    await vi.waitFor(() => {
      expect(
        file
          .querySelector(iconSelector)
          ?.getAttribute('data-material-icons-extension-filename')
      ).toBe('package.json');
      expect(
        folder
          .querySelector(iconSelector)
          ?.getAttribute('data-material-icons-extension-iconname')
      ).toBe('folder-src.svg');
    });
    expect(document.querySelectorAll(iconSelector)).toHaveLength(2);
  });
});
