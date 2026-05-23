import { describe, it, expect, vi, beforeEach } from 'vitest';
import { replaceIconInRow, replaceElementWithIcon } from './replace-icon';
import { Provider } from '../models';
import { Manifest } from 'material-icon-theme';

// Mock webextension-polyfill
vi.mock('webextension-polyfill', () => ({
  default: {
    runtime: {
      getURL: (name: string) => `chrome-extension://test-id/${name}`,
    },
  },
}));

// Mock icon-list.json
vi.mock('../icon-list.json', () => ({
  default: {
    file: 'file.svg',
    folder: 'folder.svg',
    'folder-open': 'folder-open.svg',
    'folder-src': 'folder-src.svg',
    'folder-src-open': 'folder-src-open.svg',
    'folder-git': 'folder-git.svg',
    'folder-symlink': 'folder-symlink.svg',
    typescript: 'typescript.svg',
    javascript: 'javascript.svg',
    json: 'json.svg',
    readme: 'readme.svg',
    'folder-node': 'folder-node.svg',
    'folder-node-open': 'folder-node-open.svg',
    'folder-github': 'folder-github.svg',
    'folder-github-open': 'folder-github-open.svg',
    'test-ts': 'test-ts.svg',
    'folder-light-src': 'folder-light-src.svg',
    'light-typescript': 'light-typescript.svg',
    'custom-icon': 'custom-icon.svg',
  },
}));

function createMockProvider(overrides: Partial<Provider> = {}): Provider {
  return {
    name: 'test',
    domains: [{ host: 'test.com', test: /^test\.com$/ }],
    selectors: {
      row: '.row',
      filename: '.filename',
      icon: '.icon',
      detect: null,
    },
    canSelfHost: false,
    isCustom: false,
    onAdd: () => {},
    getIsDirectory: () => false,
    getIsSubmodule: () => false,
    getIsSymlink: () => false,
    getIsLightTheme: () => false,
    replaceIcon: vi.fn(),
    transformFileName: (_row, _icon, fileName) => fileName,
    ...overrides,
  };
}

function createMockManifest(overrides: Partial<Manifest> = {}): Manifest {
  return {
    fileNames: {
      'package.json': 'json',
      'README.md': 'readme',
    },
    fileExtensions: {
      ts: 'typescript',
      js: 'javascript',
      json: 'json',
    },
    languageIds: {},
    folderNames: {
      src: 'folder-src',
      // biome-ignore lint/style/useNamingConvention: matches real folder names
      node_modules: 'folder-node',
      '.github': 'folder-github',
    },
    folderNamesExpanded: {
      src: 'folder-src-open',
      // biome-ignore lint/style/useNamingConvention: matches real folder names
      node_modules: 'folder-node-open',
      '.github': 'folder-github-open',
    },
    ...overrides,
  };
}

describe('replaceIconInRow', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should replace the icon for a TypeScript file', () => {
    const provider = createMockProvider();
    const manifest = createMockManifest();

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">index.ts</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'typescript.svg'
    );
  });

  it('should replace the icon for a file matched by exact filename', () => {
    const provider = createMockProvider();
    const manifest = createMockManifest();

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">README.md</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'readme.svg'
    );
  });

  it('should use folder icon for directories', () => {
    const provider = createMockProvider({
      getIsDirectory: () => true,
    });
    const manifest = createMockManifest();

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">src</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'folder-src.svg'
    );
  });

  it('should use expanded folder icon when folder is expanded', () => {
    const provider = createMockProvider({
      getIsDirectory: () => true,
      getIsExpanded: () => true,
    });
    const manifest = createMockManifest();

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">src</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'folder-src-open.svg'
    );
  });

  it('should use closed folder icon when folder is collapsed', () => {
    const provider = createMockProvider({
      getIsDirectory: () => true,
      getIsExpanded: () => false,
    });
    const manifest = createMockManifest();

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">src</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'folder-src.svg'
    );
  });

  it('should fall back to generic folder-open.svg for unknown expanded folders', () => {
    const provider = createMockProvider({
      getIsDirectory: () => true,
      getIsExpanded: () => true,
    });
    const manifest = createMockManifest();

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">unknown-folder</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'folder-open.svg'
    );
  });

  it('should use folder-git icon for submodules', () => {
    const provider = createMockProvider({
      getIsDirectory: () => true,
      getIsSubmodule: () => true,
    });
    const manifest = createMockManifest();

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">my-submodule</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'folder-git.svg'
    );
  });

  it('should use folder-symlink icon for symlinks', () => {
    const provider = createMockProvider({
      getIsDirectory: () => true,
      getIsSymlink: () => true,
    });
    const manifest = createMockManifest();

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">my-link</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'folder-symlink.svg'
    );
  });

  it('should not process an icon that already has the extension attribute', () => {
    const provider = createMockProvider();
    const manifest = createMockManifest();

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">index.ts</span>
        <svg class="icon" data-material-icons-extension="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).not.toHaveBeenCalled();
  });

  it('should not process a row without a filename', () => {
    const provider = createMockProvider();
    const manifest = createMockManifest();

    document.body.innerHTML = `
      <div class="row">
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).not.toHaveBeenCalled();
  });

  it('should not process a row without an icon element', () => {
    const provider = createMockProvider();
    const manifest = createMockManifest();

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">index.ts</span>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).not.toHaveBeenCalled();
  });

  it('should fall back to file.svg for unknown file extensions', () => {
    const provider = createMockProvider();
    const manifest = createMockManifest();

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">data.xyz</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'file.svg'
    );
  });

  it('should use transformFileName to modify the filename before lookup', () => {
    const provider = createMockProvider({
      transformFileName: (_row, _icon, fileName) =>
        fileName.replace(/\s+@\s+[a-fA-F0-9]+$/, ''),
    });
    const manifest = createMockManifest({
      folderNames: { 'my-submodule': 'folder-git' },
    });

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">my-submodule @ abc123</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
  });

  it('should use customMappings when they match', () => {
    const provider = createMockProvider({
      getIsDirectory: () => true,
      customMappings: [
        {
          match: () => true,
          iconName: 'folder-github',
        },
      ],
    });
    const manifest = createMockManifest();

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">any-folder</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'folder-github.svg'
    );
  });
});

describe('replaceIconInRow - edge cases', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should match filenames case-insensitively via lowerFileName lookup', () => {
    const provider = createMockProvider();
    const manifest = createMockManifest({
      fileNames: {
        'readme.md': 'readme',
      },
    });

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">README.md</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'readme.svg'
    );
  });

  it('should match .test.ts extension before .ts for multiple extensions', () => {
    const provider = createMockProvider();
    const manifest = createMockManifest({
      fileExtensions: {
        'test.ts': 'test-ts',
        ts: 'typescript',
      },
    });

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">file.test.ts</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'test-ts.svg'
    );
  });

  it('should not parse extensions for very long filenames (>255 chars) and fall back to file.svg', () => {
    const provider = createMockProvider();
    const manifest = createMockManifest();

    const fileName = 'a'.repeat(260) + '.ts'; // 263 chars > 255

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">${fileName}</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'file.svg'
    );
  });

  it('should fall back to file.svg for filename with dots but no matching extension', () => {
    const provider = createMockProvider();
    const manifest = createMockManifest();

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">foo.bar.baz</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'file.svg'
    );
  });

  it('should use light theme folder names when light theme is active', () => {
    const provider = createMockProvider({
      getIsDirectory: () => true,
      getIsLightTheme: () => true,
    });
    const manifest = createMockManifest({
      folderNames: {
        src: 'folder-src',
      },
      light: {
        folderNames: {
          src: 'folder-light-src',
        },
      },
    });

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">src</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'folder-light-src.svg'
    );
  });

  it('should use light theme file extensions when light theme is active', () => {
    const provider = createMockProvider({
      getIsLightTheme: () => true,
    });
    const manifest = createMockManifest({
      fileExtensions: {
        ts: 'typescript',
      },
      light: {
        fileExtensions: {
          ts: 'light-typescript',
        },
      },
    });

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">index.ts</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'light-typescript.svg'
    );
  });

  it('should append -open to icon name for expanded folder with no folderNamesExpanded entry', () => {
    const provider = createMockProvider({
      getIsDirectory: () => true,
      getIsExpanded: () => true,
    });
    const manifest = createMockManifest({
      folderNames: {
        src: 'folder-src',
      },
      folderNamesExpanded: {
        // No entry for 'src' — forces fallback to `${iconName}-open`
      },
    });

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">src</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    // The icon name becomes 'folder-src-open' which is in the icon list
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'folder-src-open.svg'
    );
  });

  it('should use closed folder icon when provider has no getIsExpanded method', () => {
    const provider = createMockProvider({
      getIsDirectory: () => true,
      // getIsExpanded is not provided (undefined)
    });
    // Explicitly remove getIsExpanded
    delete (provider as Partial<Provider>).getIsExpanded;

    const manifest = createMockManifest();

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">src</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    // Should not crash and should use closed folder icon
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'folder-src.svg'
    );
  });

  it('should normalize various whitespace types in filenames', () => {
    const provider = createMockProvider();
    const manifest = createMockManifest({
      fileNames: {
        'README.md': 'readme',
      },
    });

    // Use tabs and multiple spaces within the filename text content
    document.body.innerHTML = `
      <div class="row">
        <span class="filename">  \t README.md \t  </span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'readme.svg'
    );
  });

  it('should extract last segment from path-based filenames', () => {
    const provider = createMockProvider();
    const manifest = createMockManifest();

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">src/lib/index.ts</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    // Should resolve 'index.ts' -> typescript extension
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'typescript.svg'
    );
  });

  it('should give customMappings priority over manifest entries', () => {
    const provider = createMockProvider({
      customMappings: [
        {
          match: () => true,
          iconName: 'custom-icon',
        },
      ],
    });
    // Manifest has a match for 'package.json' -> 'json', but customMappings should win
    const manifest = createMockManifest();

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">package.json</span>
        <svg class="icon"></svg>
      </div>
    `;
    const row = document.querySelector('.row') as HTMLElement;

    replaceIconInRow(row, provider, manifest);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'custom-icon.svg'
    );
  });
});

describe('replaceElementWithIcon', () => {
  it('should create an img element with correct attributes and call provider.replaceIcon', () => {
    const provider = createMockProvider();

    document.body.innerHTML = '<svg class="icon"></svg>';
    const iconEl = document.querySelector('.icon') as HTMLElement;

    replaceElementWithIcon(iconEl, 'typescript.svg', 'index.ts', provider);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const [oldIcon, newIcon] = (
      provider.replaceIcon as ReturnType<typeof vi.fn>
    ).mock.calls[0];
    expect(oldIcon).toBe(iconEl);
    expect(newIcon.tagName).toBe('IMG');
    expect(newIcon.getAttribute('data-material-icons-extension')).toBe('icon');
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'typescript.svg'
    );
    expect(newIcon.getAttribute('data-material-icons-extension-filename')).toBe(
      'index.ts'
    );
    expect(newIcon.getAttribute('src')).toBe(
      'chrome-extension://test-id/typescript.svg'
    );
  });
});
