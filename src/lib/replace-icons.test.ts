import { describe, it, expect, vi, beforeEach } from 'vitest';
import { replaceAllIcons } from './replace-icons';
import { Provider } from '../models';

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
    typescript: 'typescript.svg',
    folder: 'folder.svg',
  },
}));

// Mock selector-observer (not needed for replaceAllIcons but imported in module)
vi.mock('selector-observer', () => ({
  observe: vi.fn(),
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

describe('replaceAllIcons', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should call replaceIcon for each element with data-material-icons-extension-iconname', () => {
    const provider = createMockProvider();

    document.body.innerHTML = `
      <svg data-material-icons-extension-iconname="typescript.svg" data-material-icons-extension-filename="index.ts"></svg>
      <svg data-material-icons-extension-iconname="folder.svg" data-material-icons-extension-filename="src"></svg>
    `;

    replaceAllIcons(provider);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(2);
  });

  it('should not call replaceIcon for elements without iconname attribute', () => {
    const provider = createMockProvider();

    document.body.innerHTML = `
      <svg class="octicon octicon-file"></svg>
      <svg data-material-icons-extension="icon"></svg>
    `;

    replaceAllIcons(provider);

    expect(provider.replaceIcon).not.toHaveBeenCalled();
  });

  it('should skip elements with empty iconname', () => {
    const provider = createMockProvider();

    document.body.innerHTML = `
      <svg data-material-icons-extension-iconname="" data-material-icons-extension-filename="test.ts"></svg>
    `;

    replaceAllIcons(provider);

    expect(provider.replaceIcon).not.toHaveBeenCalled();
  });

  it('should pass correct iconName and fileName to replaceElementWithIcon', () => {
    const provider = createMockProvider();

    document.body.innerHTML = `
      <svg data-material-icons-extension-iconname="typescript.svg" data-material-icons-extension-filename="app.ts"></svg>
    `;

    replaceAllIcons(provider);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'typescript.svg'
    );
    expect(newIcon.getAttribute('data-material-icons-extension-filename')).toBe(
      'app.ts'
    );
    expect(newIcon.getAttribute('src')).toBe(
      'chrome-extension://test-id/typescript.svg'
    );
  });

  it('should work with img elements (other providers)', () => {
    const provider = createMockProvider();

    document.body.innerHTML = `
      <img data-material-icons-extension-iconname="typescript.svg" data-material-icons-extension-filename="index.ts" src="chrome-extension://old/typescript.svg">
    `;

    replaceAllIcons(provider);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
  });

  it('should handle missing filename attribute gracefully', () => {
    const provider = createMockProvider();

    document.body.innerHTML = `
      <svg data-material-icons-extension-iconname="typescript.svg"></svg>
    `;

    replaceAllIcons(provider);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-filename')).toBe(
      ''
    );
  });
});
